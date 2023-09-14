/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQueryInput } from 'querystring'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { hasAnyRole, apiDateToDatePicker, datePickerToApi, calculatePunishmentEndDate } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import validateForm from './enterStartDateValidation'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  startDate?: string
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

export default class SuspendedUntilDatePage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, startDate } = pageData

    return res.render(`pages/punishmentStartDate.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      startDate,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, req.params.redisId)
      return this.renderView(req, res, {
        startDate: sessionData.startDate && apiDateToDatePicker(sessionData.startDate),
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { startDate } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } = req.query
    const type = PunishmentType[punishmentType as string]

    const error = validateForm({
      startDate,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        startDate,
      })

    const numberOfDays = Number(days)

    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        days: numberOfDays,
        startDate: datePickerToApi(startDate),
        endDate: calculatePunishmentEndDate(startDate, numberOfDays, 'YYYY-MM-DD'),
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

    const nextPage = url.format({
      pathname: adjudicationUrls.punishmentAutomaticDateSchedule.urls.start(chargeNumber),
      query: {
        punishmentType,
        privilegeType,
        otherPrivilege,
        stoppagePercentage,
        days,
        startDate,
      } as ParsedUrlQueryInput,
    })

    return res.redirect(nextPage)
  }
}
