/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import validateForm from './punishmentScheduleValidation'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import { datePickerToApi, hasAnyRole, apiDateToDatePicker } from '../../utils/utils'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../data/PunishmentResult'

type PageData = {
  error?: FormError
  days?: number
  suspended?: string
  suspendedUntil?: string
  startDate?: string
  endDate?: string
  displaySuspended: boolean
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

export default class PunishmentSchedulePage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { error, days, suspended, suspendedUntil, startDate, endDate, displaySuspended } = pageData

    return res.render(`pages/punishmentSchedule.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      errors: error ? [error] : [],
      days,
      suspended,
      suspendedUntil,
      startDate,
      endDate,
      displaySuspended,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const punishmentType = PunishmentType[req.query.punishmentType as string]
    const displaySuspended = ![PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(punishmentType)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(
        req,
        adjudicationNumber,
        req.params.redisId
      )
      return this.renderView(req, res, {
        days: sessionData.days,
        suspended: sessionData.suspendedUntil ? 'yes' : 'no',
        suspendedUntil: sessionData.suspendedUntil && apiDateToDatePicker(sessionData.suspendedUntil),
        startDate: sessionData.startDate && apiDateToDatePicker(sessionData.startDate),
        endDate: sessionData.endDate && apiDateToDatePicker(sessionData.endDate),
        displaySuspended,
      })
    }

    return this.renderView(req, res, { displaySuspended })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { days, suspended, suspendedUntil, startDate, endDate } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage } = req.query
    const type = PunishmentType[punishmentType as string]
    const displaySuspended = ![PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(type)

    const trimmedDays = days ? Number(String(days).trim()) : null

    const error = validateForm({
      days: trimmedDays,
      suspended,
      suspendedUntil,
      startDate,
      endDate,
      punishmentType: type,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        days: trimmedDays,
        suspended,
        suspendedUntil,
        startDate,
        endDate,
        displaySuspended,
      })
    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        days: trimmedDays,
        suspendedUntil: suspendedUntil ? datePickerToApi(suspendedUntil) : null,
        startDate: startDate ? datePickerToApi(startDate) : null,
        endDate: endDate ? datePickerToApi(endDate) : null,
      }

      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(
          req,
          punishmentData,
          adjudicationNumber,
          req.params.redisId
        )
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, adjudicationNumber)
      }
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber)
      throw postError
    }

    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber))
  }
}
