import { Request, Response } from 'express'
import url from 'url'
import { FormError } from '../../../@types/template'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './damagesOwedValidation'

export default class DamagesOwedPage {
  constructor(private readonly userService: UserService) {}

  private renderView = async (
    req: Request,
    res: Response,
    damagesOwed: string,
    error: FormError | null
  ): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/damagesOwed.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      damagesOwed,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, null, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { damagesOwed, amount } = req.body
    const { plea, adjudicator } = req.query

    const error = validateForm({ damagesOwed, amount })
    if (error) return this.renderView(req, res, damagesOwed, error)

    try {
      if (!this.validateDataFromEnterHearingOutcomePage(plea as HearingOutcomePlea, adjudicator as string)) {
        return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber))
      }

      return res.redirect(
        url.format({
          pathname: adjudicationUrls.isThisACaution.urls.start(adjudicationNumber),
          query: {
            adjudicator: adjudicator.toString(),
            plea: HearingOutcomePlea[plea.toString()],
            amount,
          },
        })
      )
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }

  private validateDataFromEnterHearingOutcomePage = (plea: HearingOutcomePlea, adjudicator: string) => {
    if (!plea || !adjudicator) return false
    return true
  }
}
