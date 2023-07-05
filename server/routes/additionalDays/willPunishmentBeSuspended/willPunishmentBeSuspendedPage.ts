/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import validateForm from './willPunishmentBeSuspendedValidation'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { apiDateToDatePicker, datePickerToApi, hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  suspended?: string
  suspendedUntil?: string
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

export default class WillPunishmentBeSuspendedPage {
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
    const { error, suspended, suspendedUntil } = pageData

    return res.render(`pages/willPunishmentBeSuspended.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      errors: error ? [error] : [],
      suspended,
      suspendedUntil,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const adjudicationNumber = Number(req.params.adjudicationNumber)

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
        suspended: sessionData.suspendedUntil ? 'yes' : 'no',
        suspendedUntil: sessionData.suspendedUntil && apiDateToDatePicker(sessionData.suspendedUntil),
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { suspended, suspendedUntil } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } = req.query
    const type = PunishmentType[punishmentType as string]

    const error = validateForm({
      suspended,
      suspendedUntil,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        suspended,
        suspendedUntil,
      })

    if (suspended === 'no') {
      const redirectUrlPrefix = this.getRedirectUrl(adjudicationNumber, req)
      return res.redirect(
        url.format({
          pathname: redirectUrlPrefix,
          query: { ...req.query, suspendedUntil },
        })
      )
    }
    try {
      const punishmentData = {
        type,
        privilegeType: privilegeType ? PrivilegeType[privilegeType as string] : null,
        otherPrivilege: otherPrivilege ? (otherPrivilege as string) : null,
        stoppagePercentage: stoppagePercentage ? Number(stoppagePercentage) : null,
        days: Number(days),
        suspendedUntil: suspendedUntil ? datePickerToApi(suspendedUntil) : null,
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
      res.locals.redirectUrl = adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber)
      throw postError
    }
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber))
  }

  private getRedirectUrl = (adjudicationNumber: number, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.isPunishmentConsecutive.urls.edit(adjudicationNumber, req.params.redisId)
    }
    return adjudicationUrls.isPunishmentConsecutive.urls.start(adjudicationNumber)
  }
}
