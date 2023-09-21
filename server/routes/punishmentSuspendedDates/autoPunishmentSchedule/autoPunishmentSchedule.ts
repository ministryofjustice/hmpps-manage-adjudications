/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQueryInput } from 'querystring'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

type PageData = {
  startDate?: string
  endDate?: string
  days?: number
  type?: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  redisId?: string
}

export default class AutoPunishmentSuspendedSchedulePage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { startDate, endDate, days, type, privilegeType, otherPrivilege, stoppagePercentage, redisId } = pageData
    const { punishmentNumberToActivate } = req.query

    const startDateChangeHref = url.format({
      pathname: adjudicationUrls.suspendedPunishmentStartDate.urls.edit(chargeNumber, redisId),
      query: {
        punishmentType: type,
        privilegeType,
        otherPrivilege,
        stoppagePercentage,
        days,
        punishmentNumberToActivate,
      } as ParsedUrlQueryInput,
    })

    const daysChangeHref = url.format({
      pathname: adjudicationUrls.suspendedPunishmentNumberOfDays.urls.edit(chargeNumber, redisId),
      query: {
        punishmentType: type,
        privilegeType,
        otherPrivilege,
        stoppagePercentage,
        days,
        punishmentNumberToActivate,
      } as ParsedUrlQueryInput,
    })

    return res.render(`pages/autoPunishmentSchedule.njk`, {
      chargeNumber,
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      startDateChangeHref,
      daysChangeHref,
      startDate,
      endDate,
      type,
      days,
      privilegeType,
      otherPrivilege,
      stoppagePercentage,
      redisId,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const sessionPunishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    const lastAddedPunishment = sessionPunishments[sessionPunishments.length - 1] || {}
    if (!lastAddedPunishment) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    return this.renderView(req, res, {
      startDate: lastAddedPunishment.startDate,
      endDate: lastAddedPunishment.endDate,
      days: lastAddedPunishment.days,
      type: lastAddedPunishment.type,
      privilegeType: lastAddedPunishment.privilegeType,
      otherPrivilege: lastAddedPunishment.otherPrivilege,
      stoppagePercentage: lastAddedPunishment.stoppagePercentage,
      redisId: lastAddedPunishment.redisId,
    })
  }
}
