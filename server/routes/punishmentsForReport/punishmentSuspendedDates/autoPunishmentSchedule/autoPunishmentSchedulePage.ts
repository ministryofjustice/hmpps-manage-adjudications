import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
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
  chargeNumberForSuspendedPunishment?: string
}

export default class AutoPunishmentSuspendedSchedulePage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const {
      startDate,
      endDate,
      duration,
      type,
      privilegeType,
      otherPrivilege,
      stoppagePercentage,
      redisId,
      chargeNumberForSuspendedPunishment,
    } = pageData
    const { punishmentNumberToActivate } = req.query

    const startDateChangePath = this.getPathnameForStartDateEdit(chargeNumber, redisId)
    const daysPath = this.getPathnameForDaysEdit(chargeNumber, redisId)

    const startDateChangeHref = url.format({
      pathname: startDateChangePath,
      query: {
        punishmentType: type,
        privilegeType,
        otherPrivilege,
        stoppagePercentage,
        duration,
        punishmentNumberToActivate,
        chargeNumberForSuspendedPunishment,
      } as ParsedUrlQueryInput,
    })

    const daysChangeHref = url.format({
      pathname: daysPath,
      query: {
        punishmentType: type,
        privilegeType,
        otherPrivilege,
        stoppagePercentage,
        duration,
        punishmentNumberToActivate,
        chargeNumberForSuspendedPunishment,
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
      chargeNumberForSuspendedPunishment: lastAddedPunishment.activatedFrom,
    })
  }

  getPathnameForStartDateEdit = (chargeNumber: string, redisId: string) => {
    return adjudicationUrls.suspendedPunishmentStartDate.urls.edit(chargeNumber, redisId)
  }

  getPathnameForDaysEdit = (chargeNumber: string, redisId: string) => {
    return adjudicationUrls.suspendedPunishmentNumberOfDays.urls.edit(chargeNumber, redisId)
  }
}
