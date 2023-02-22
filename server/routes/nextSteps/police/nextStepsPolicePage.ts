import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import OutcomesService from '../../../services/outcomesService'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './nextStepsPoliceValidation'

type PageData = {
  error?: FormError
  prosecutionChosen?: string
  nextStepChosen?: string
}

export default class NextStepsPolicePage {
  constructor(private readonly userService: UserService, private readonly outcomesService: OutcomesService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { error, prosecutionChosen, nextStepChosen } = pageData

    return res.render(`pages/nextStepsPolice.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      prosecutionChosen,
      nextStepChosen,
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
    const { prosecutionChosen, nextStepChosen } = req.body

    const error = validateForm({ prosecutionChosen, nextStepChosen })
    if (error) return this.renderView(req, res, { error, prosecutionChosen, nextStepChosen })

    try {
      if (prosecutionChosen === 'yes') {
        await this.outcomesService.createProsecution(adjudicationNumber, user)
        return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
      }

      if (nextStepChosen === 'schedule_hearing')
        return res.redirect(adjudicationUrls.scheduleHearing.urls.start(adjudicationNumber))
      return res.redirect(adjudicationUrls.reasonForNotProceeding.urls.start(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
