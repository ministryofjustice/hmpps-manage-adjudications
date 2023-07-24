/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import { FormError } from '../../../@types/template'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import validateForm from './manualEntryConsecutivePunishmentValidation'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

type PageData = {
  error?: FormError
  chargeNumber?: number
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { error, chargeNumber } = pageData

    return res.render(`pages/manualEntryConsecutivePunishment.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      errors: error ? [error] : [],
      chargeNumber,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

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
        chargeNumber: sessionData.chargeNumber,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { chargeNumber } = req.body
    const { punishmentType, privilegeType, otherPrivilege, stoppagePercentage, days } = req.query
    const type = PunishmentType[punishmentType as string]

    const trimmedChargeNumber = chargeNumber ? Number(String(chargeNumber).trim()) : null

    const error = validateForm({
      chargeNumber: trimmedChargeNumber,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        chargeNumber: trimmedChargeNumber,
      })

    const chargeNumberValid = await this.punishmentsService.validateChargeNumber(
      adjudicationNumber,
      type as PunishmentType,
      trimmedChargeNumber,
      user
    )
    if (!chargeNumberValid) {
      return res.redirect(
        url.format({
          pathname: adjudicationUrls.manualConsecutivePunishmentError.urls.start(adjudicationNumber),
          query: { ...(req.query as ParsedUrlQueryInput) },
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
        consecutiveReportNumber: trimmedChargeNumber,
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
}
