import { Request, Response } from 'express'
import { FormError } from '../../@types/template'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'
import validateForm from './prosecutionValidation'

export default class ProsecutionPage {
  constructor(private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, error: FormError | null): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/prosecution.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { prosecutionChosen, nextStepChosen } = req.body

    const error = validateForm({ prosecutionChosen, nextStepChosen })
    if (error) return this.renderView(req, res, error)

    try {
      if (prosecutionChosen === 'yes')
        // create outcome...TODO, Service maybe in Nat's branch.
        return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
      if (nextStepChosen === 'schedule_hearing')
        return res.redirect(adjudicationUrls.scheduleHearing.urls.start(adjudicationNumber))
      return res.redirect(adjudicationUrls.reasonForNotProceeding.urls.start(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
