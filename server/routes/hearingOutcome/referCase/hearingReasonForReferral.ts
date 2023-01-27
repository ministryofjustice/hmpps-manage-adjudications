import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import UserService from '../../../services/userService'
import { HearingOutcomeCode } from '../../../data/HearingResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import HearingsService from '../../../services/hearingsService'
import validateForm from './hearingReasonForReferralValidation'

type PageData = {
  error?: FormError | FormError[]
  referralReason?: string
}

export default class HearingReasonForReferralPage {
  constructor(private readonly hearingsService: HearingsService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, referralReason } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/hearingOutcome/reasonForReferral.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      referralReason,
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
    const hearingId = Number(req.params.hearingId)
    const { hearingOutcome, adjudicatorName } = req.query
    const { referralReason } = req.body

    const error = validateForm({ referralReason })
    if (error)
      return this.renderView(req, res, {
        error,
        referralReason,
      })

    // We need to check the data from previous page hasn't been lost/tampered with
    if (!hearingOutcome || !adjudicatorName)
      return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber, hearingId))

    try {
      await this.hearingsService.postHearingReferralOutcome(
        adjudicationNumber,
        hearingId,
        hearingOutcome as HearingOutcomeCode,
        adjudicatorName as string,
        referralReason,
        user
      )
      return res.redirect(adjudicationUrls.hearingReferralConfirmation.urls.start(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
