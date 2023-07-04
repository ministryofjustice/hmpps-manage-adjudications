/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import validateForm from './numberOfAdditionalDaysValidation'
import { FormError } from '../../@types/template'
import UserService from '../../services/userService'
import { hasAnyRole } from '../../utils/utils'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'

type PageData = {
  error?: FormError
  days?: number
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
    const { error, days } = pageData

    return res.render(`pages/numberOfAdditionalDays.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      errors: error ? [error] : [],
      days,
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
        days: sessionData.days,
      })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { days } = req.body

    const trimmedDays = days ? Number(String(days).trim()) : null

    const error = validateForm({
      days: trimmedDays,
    })

    if (error)
      return this.renderView(req, res, {
        error,
        days: trimmedDays,
      })

    const redirectUrlPrefix = this.getRedirectUrl(adjudicationNumber, req)
    return res.redirect(
      url.format({
        pathname: redirectUrlPrefix,
        query: { ...req.query, days: trimmedDays },
      })
    )
  }

  private getRedirectUrl = (adjudicationNumber: number, req: Request) => {
    if (this.pageOptions.isEdit()) {
      return adjudicationUrls.isPunishmentSuspended.urls.edit(adjudicationNumber, req.params.redisId)
    }
    return adjudicationUrls.isPunishmentSuspended.urls.start(adjudicationNumber)
  }
}
