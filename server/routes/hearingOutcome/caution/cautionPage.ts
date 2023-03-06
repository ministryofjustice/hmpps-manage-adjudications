import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import HearingsService from '../../../services/hearingsService'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './cautionValidation'

export default class CautionPage {
  constructor(private readonly hearingsService: HearingsService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, caution: string, error: FormError | null): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/caution.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      caution,
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
    const { caution } = req.body
    const { plea, adjudicator, amount } = req.query
    const { user } = res.locals

    const error = validateForm({ caution })
    if (error) return this.renderView(req, res, caution, error)

    try {
      if (!this.validateDataFromEnterHearingOutcomePage(plea as HearingOutcomePlea, adjudicator as string)) {
        return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber))
      }

      const actualAmount = amount as string

      await this.hearingsService.createChargedProvedHearingOutcome(
        adjudicationNumber,
        adjudicator as string,
        HearingOutcomePlea[plea.toString()],
        caution,
        user,
        !actualAmount ? null : actualAmount
      )

      return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
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
