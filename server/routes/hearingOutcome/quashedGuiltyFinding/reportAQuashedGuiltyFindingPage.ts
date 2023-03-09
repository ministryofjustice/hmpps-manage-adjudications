/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './reportAQuashedGuiltyFindingValidation'
import { User } from '../../../data/hmppsAuthClient'
import { QuashGuiltyFindingReason } from '../../../data/HearingAndOutcomeResult'
import OutcomesService from '../../../services/outcomesService'

export enum PageRequestType {
  CREATION,
}

type PageData = {
  error?: FormError | FormError[]
  quashReason?: QuashGuiltyFindingReason
  quashDetails?: string
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}
}

export default class ReportAQuashedGuiltyFindingPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly outcomesService: OutcomesService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, quashReason, quashDetails } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return res.render(`pages/hearingOutcome/reportAQuashedGuiltyFinding.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      quashReason,
      quashDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { quashReason, quashDetails } = req.body

    const error = validateForm({ quashReason, quashDetails })
    if (error)
      return this.renderView(req, res, {
        error,
        quashReason,
        quashDetails,
      })

    try {
      return res.redirect(adjudicationUrls.punishmentDetails.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
