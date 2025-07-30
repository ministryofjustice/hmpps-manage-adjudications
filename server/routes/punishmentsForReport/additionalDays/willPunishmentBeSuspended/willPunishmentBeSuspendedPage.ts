/* eslint-disable max-classes-per-file */
import url from 'url'
import { ParsedUrlQueryInput } from 'querystring'
import { Request, Response } from 'express'
import validateForm from './willPunishmentBeSuspendedValidation'
import { FormError } from '../../../../@types/template'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

type PageData = {
  error?: FormError
  suspended?: string
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
    private readonly punishmentsService: PunishmentsService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, suspended } = pageData

    return res.render(`pages/willPunishmentBeSuspended.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      suspended,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    if (this.pageOptions.isEdit()) {
      const sessionData = await this.punishmentsService.getSessionPunishment(req, chargeNumber, req.params.redisId)
      return this.renderView(req, res, {
        suspended: sessionData.suspendedUntil ? 'yes' : 'no',
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { suspended } = req.body

    const error = validateForm({
      suspended,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        suspended,
      })

    if (suspended === 'no') {
      const redirectUrlPrefixForNo = this.getRedirectUrlForNo(chargeNumber, req)
      return res.redirect(
        url.format({
          pathname: redirectUrlPrefixForNo,
          query: req.query as ParsedUrlQueryInput,
        }),
      )
    }

    const redirectUrlPrefixForYes = this.getRedirectUrlForYes(chargeNumber, req)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefixForYes,
        query: req.query as ParsedUrlQueryInput,
      }),
    )
  }

  private getRedirectUrlForNo = (chargeNumber: string, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.isPunishmentConsecutive.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.isPunishmentConsecutive.urls.start(chargeNumber)
  }

  private getRedirectUrlForYes = (chargeNumber: string, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.punishmentSuspendedUntilAdditionalDays.urls.edit(chargeNumber, req.params.redisId)
    }
    return adjudicationUrls.punishmentSuspendedUntilAdditionalDays.urls.start(chargeNumber)
  }
}
