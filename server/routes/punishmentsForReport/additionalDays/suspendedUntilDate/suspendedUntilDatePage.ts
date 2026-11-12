/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import moment from 'moment'
import validateForm from './suspendedUntilValidation'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole, apiDateToDatePicker, datePickerToApi, formatTimestampTo } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { PrivilegeType, PunishmentType, RehabilitativeActivity } from '../../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  suspendedUntil?: string
  lastHearingDate?: string
  lastSuspendedDate?: string
}

export enum PageRequestType {
  CREATION,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class SuspendedUntilDateAdditionalDaysPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, suspendedUntil, lastHearingDate, lastSuspendedDate } = pageData

    return res.render(`pages/punishmentSuspendedUntilDate.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      suspendedUntil,
      lastHearingDate,
      lastSuspendedDate,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { user } = res.locals

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    // Get dates to limit range of date picker
    const lastHearingDate = await this.punishmentsService.getLastHearingDate(chargeNumber, user)
    const lastSuspendedDate = moment(lastHearingDate).add(6, 'months').format('DD/MM/YYYY')

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, req.params.redisId)
      return this.renderView(req, res, {
        suspendedUntil: sessionData.suspendedUntil && apiDateToDatePicker(sessionData.suspendedUntil),
        lastHearingDate: formatTimestampTo(lastHearingDate, 'DD/MM/YYYY'),
        lastSuspendedDate,
      })
    }

    return this.renderView(req, res, {
      lastHearingDate: formatTimestampTo(lastHearingDate, 'DD/MM/YYYY'),
      lastSuspendedDate,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { suspendedUntil } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, duration } = req.query
    const type = PunishmentType[punishmentType as keyof typeof PunishmentType]
    const { user } = res.locals
    const lastHearingDate = await this.punishmentsService.getLastHearingDate(chargeNumber, user)
    const lastSuspendedDate = moment(lastHearingDate).add(6, 'months').format('YYYY-MM-DD')

    const error = validateForm({
      suspendedUntil,
      lastHearingDate,
      lastSuspendedDate,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        suspendedUntil,
      })

    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as keyof typeof PrivilegeType] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        duration: Number(duration),
        suspendedUntil: suspendedUntil ? datePickerToApi(suspendedUntil) : null,
        rehabilitativeActivities: [] as RehabilitativeActivity[],
      }

      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(req, punishmentData, chargeNumber, req.params.redisId)
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, chargeNumber)
      }
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
      throw postError
    }

    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
