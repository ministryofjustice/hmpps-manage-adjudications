/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './reasonForFindingValidation'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'

type PageData = {
  error?: FormError | FormError[]
  reasonForFinding?: string
}

export default class ReasonForFindingPage {
  constructor(private readonly hearingsService: HearingsService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, reasonForFinding } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/hearingOutcome/reasonForFinding.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      reasonForFinding,
    })
  }

  private validateQueryData = (adjudicator: string, plea: HearingOutcomePlea) => {
    if (!adjudicator || !plea || !HearingOutcomePlea[plea]) return false
    return true
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
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { reasonForFinding } = req.body
    const { adjudicator, plea } = req.query

    const error = validateForm({ reasonForFinding })
    if (error)
      return this.renderView(req, res, {
        error,
        reasonForFinding,
      })

    if (!this.validateQueryData(adjudicator as string, plea as HearingOutcomePlea)) {
      // TODO: when edit is implemented we will need to send them back to edit version when required
      return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber))
    }

    try {
      await this.hearingsService.createDismissedHearingOutcome(
        adjudicationNumber,
        adjudicator as string,
        plea as HearingOutcomePlea,
        reasonForFinding,
        user
      )
      return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber)
      throw postError
    }
  }
}
