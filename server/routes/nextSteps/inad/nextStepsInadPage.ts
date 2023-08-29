import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './nextStepsInadValidation'

export default class NextStepsInadPage {
  constructor(private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, error: FormError | null): Promise<void> => {
    const { chargeNumber } = req.params

    return res.render(`pages/nextStepsInad.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
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
    const { chargeNumber } = req.params
    const { nextStepChosen } = req.body

    const error = validateForm({ nextStepChosen })
    if (error) return this.renderView(req, res, error)

    try {
      if (nextStepChosen === 'schedule_hearing') {
        return res.redirect(adjudicationUrls.scheduleHearing.urls.start(chargeNumber))
      }
      if (nextStepChosen === 'refer_gov') {
        return res.redirect(adjudicationUrls.govReasonForReferral.urls.start(chargeNumber))
      }
      return res.redirect(adjudicationUrls.reasonForNotProceeding.urls.start(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
      throw postError
    }
  }
}
