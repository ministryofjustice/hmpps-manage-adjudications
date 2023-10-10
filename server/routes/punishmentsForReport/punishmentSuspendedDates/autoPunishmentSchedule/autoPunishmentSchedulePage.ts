/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQueryInput } from 'querystring'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  startDate?: string
  endDate?: string
  days?: number
  type?: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  redisId?: string
  reportNo?: string
}

export enum PageRequestType {
  EXISTING,
  MANUAL,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isManual(): boolean {
    return this.pageType === PageRequestType.MANUAL
  }
}

export default class AutoPunishmentSuspendedSchedulePage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { startDate, endDate, days, type, privilegeType, otherPrivilege, stoppagePercentage, redisId, reportNo } =
      pageData
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
        days,
        punishmentNumberToActivate,
        reportNo,
      } as ParsedUrlQueryInput,
    })

    const daysChangeHref = url.format({
      pathname: daysPath,
      query: {
        punishmentType: type,
        privilegeType,
        otherPrivilege,
        stoppagePercentage,
        days,
        punishmentNumberToActivate,
        reportNo,
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
      reportNo: lastAddedPunishment.activatedFrom,
    })
  }

  getPathnameForStartDateEdit = (chargeNumber: string, redisId: string) => {
    if (this.pageOptions.isManual()) {
      return adjudicationUrls.suspendedPunishmentStartDate.urls.manualEdit(chargeNumber, redisId)
    }

    return adjudicationUrls.suspendedPunishmentStartDate.urls.edit(chargeNumber, redisId)
  }

  getPathnameForDaysEdit = (chargeNumber: string, redisId: string) => {
    if (this.pageOptions.isManual()) {
      return adjudicationUrls.suspendedPunishmentNumberOfDays.urls.manualEdit(chargeNumber, redisId)
    }
    return adjudicationUrls.suspendedPunishmentNumberOfDays.urls.edit(chargeNumber, redisId)
  }
}
