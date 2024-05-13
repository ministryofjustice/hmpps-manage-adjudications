/* eslint-disable max-classes-per-file */
import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  startDate?: string
  endDate?: string
  duration?: number
  type?: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  redisId?: string
}

export default class AutoPunishmentSchedulePage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { startDate, endDate, duration, type, privilegeType, otherPrivilege, stoppagePercentage, redisId } = pageData

    const startDateChangeHref = url.format({
      pathname: adjudicationUrls.punishmentStartDate.urls.edit(chargeNumber, redisId),
      query: {
        punishmentType: type,
        privilegeType,
        otherPrivilege,
        stoppagePercentage,
        duration,
      } as ParsedUrlQueryInput,
    })

    const daysChangeHref = url.format({
      pathname: adjudicationUrls.punishmentNumberOfDays.urls.edit(chargeNumber, redisId),
      query: {
        punishmentType: type,
        privilegeType,
        otherPrivilege,
        stoppagePercentage,
        duration,
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
      duration,
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
      duration: lastAddedPunishment.duration,
      type: lastAddedPunishment.type,
      privilegeType: lastAddedPunishment.privilegeType,
      otherPrivilege: lastAddedPunishment.otherPrivilege,
      stoppagePercentage: lastAddedPunishment.stoppagePercentage,
      redisId: lastAddedPunishment.redisId,
    })
  }
}
