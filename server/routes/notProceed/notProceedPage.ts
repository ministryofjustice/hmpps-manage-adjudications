import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import OutcomesService from '../../services/outcomesService'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'
import validateForm from './notProceedValidation'

type PageData = {
  error?: FormError
  notProceedReason?: string
  notProceedDetails?: string
}

export default class NotProceedPage {
  constructor(private readonly userService: UserService, private readonly outcomesService: OutcomesService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { error, notProceedReason, notProceedDetails } = pageData

    return res.render(`pages/notProceed.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      notProceedReason,
      notProceedDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { notProceedReason, notProceedDetails } = req.body

    const error = validateForm({ notProceedReason, notProceedDetails })
    if (error) return this.renderView(req, res, { error, notProceedReason, notProceedDetails })

    try {
      await this.outcomesService.createNotProceed(adjudicationNumber, notProceedReason, notProceedDetails, user)
      return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
