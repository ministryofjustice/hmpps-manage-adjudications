/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQuery } from 'querystring'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import validateForm from './paybackPunishmentDetailsValidation'

type PageData = {
  error?: FormError
  paybackNotes?: string
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

export default class PaybackPunishmentDetailsPage {
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
    const { error, paybackNotes } = pageData

    return res.render(`pages/paybackPunishmentDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      paybackNotes,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, redisId } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)

      return this.renderView(req, res, {
        paybackNotes: sessionData?.paybackNotes,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId } = req.params
    const { paybackNotes } = req.body
    const { duration, lastDay } = req.query

    const error = validateForm({ paybackNotes })

    if (error)
      return this.renderView(req, res, {
        error,
        paybackNotes,
      })

    const redirectUrl = this.getRedirectUrl(chargeNumber, redisId)
    const query = { duration, lastDay, paybackNotes } as ParsedUrlQuery
    return res.redirect(
      url.format({
        pathname: redirectUrl,
        query,
      })
    )
  }

  private getRedirectUrl = (chargeNumber: string, redisId: string) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.paybackPunishmentDetails.urls.edit(chargeNumber, redisId)
    }
    return adjudicationUrls.paybackPunishmentDetails.urls.start(chargeNumber)
  }
}
