/* eslint-disable max-classes-per-file */
import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import validateForm from './manualEntryConsecutivePunishmentValidation'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  consecutiveChargeNumber?: string
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

export default class ManualEntryConsecutivePunishmentPage {
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
    const { error, consecutiveChargeNumber } = pageData

    return res.render(`pages/manualEntryConsecutivePunishment.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      consecutiveChargeNumber,
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
        consecutiveChargeNumber: sessionData.consecutiveChargeNumber,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { consecutiveChargeNumber } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days, reportNo } = req.query
    const type = PunishmentType[punishmentType as string]

    const trimmedConsecutiveChargeNumber = consecutiveChargeNumber ? String(consecutiveChargeNumber).trim() : null

    const redirectForErrorPage = url.format({
      pathname: this.getRedirectUrlForErrorPage(chargeNumber, req),
      query: { ...(req.query as ParsedUrlQueryInput) },
    })

    const error = validateForm({
      consecutiveChargeNumber: trimmedConsecutiveChargeNumber,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        consecutiveChargeNumber: trimmedConsecutiveChargeNumber,
      })

    const consecutiveChargeNumberValid = await this.punishmentsService.validateChargeNumber(
      chargeNumber,
      type as PunishmentType,
      trimmedConsecutiveChargeNumber,
      user
    )
    if (!consecutiveChargeNumberValid) {
      return res.redirect(
        url.format({
          pathname: adjudicationUrls.manualConsecutivePunishmentError.urls.start(chargeNumber),
          query: {
            ...req.query,
            consecutiveChargeNumber: trimmedConsecutiveChargeNumber,
            redirectUrl: redirectForErrorPage,
          },
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
        consecutiveChargeNumber: trimmedConsecutiveChargeNumber,
        activatedFrom: reportNo && String(reportNo),
      }

      if (this.pageOptions.isEdit()) {
        await this.punishmentsService.updateSessionPunishment(req, punishmentData, chargeNumber, req.params.redisId)
      } else {
        await this.punishmentsService.addSessionPunishment(req, punishmentData, chargeNumber)
      }
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.awardPunishments.urls.modified(chargeNumber)
      throw postError
    }

    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }

  getRedirectUrlForErrorPage = (chargeNumber: string, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(chargeNumber)
  }
}
