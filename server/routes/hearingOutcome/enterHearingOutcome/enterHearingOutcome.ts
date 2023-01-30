import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import UserService from '../../../services/userService'
import { HearingOutcomeCode } from '../../../data/HearingResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './hearingOutcomeValidation'

type PageData = {
  error?: FormError | FormError[]
  hearingOutcome?: HearingOutcomeCode
  adjudicatorName?: string
}

export default class EnterHearingOutcomePage {
  constructor(private readonly userService: UserService) {}

  private getRedirectUrl = (outcome: HearingOutcomeCode, adjudicationNumber: number, hearingId: number) => {
    switch (outcome) {
      case HearingOutcomeCode.ADJOURN:
        return adjudicationUrls.hearingAdjourned.urls.start(adjudicationNumber, hearingId)
      case HearingOutcomeCode.COMPLETE:
        return adjudicationUrls.hearingPleaAndFinding.urls.start(adjudicationNumber, hearingId)
      default:
        return adjudicationUrls.hearingReasonForReferral.urls.start(adjudicationNumber, hearingId)
    }
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, hearingOutcome, adjudicatorName } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/hearingOutcome/enterHearingOutcome.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      hearingOutcome,
      adjudicatorName,
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const hearingId = Number(req.params.hearingId)
    const { hearingOutcome, adjudicatorName } = req.body

    const error = validateForm({ hearingOutcome, adjudicatorName })
    if (error)
      return this.renderView(req, res, {
        error,
        hearingOutcome,
        adjudicatorName,
      })

    const redirectUrlPrefix = this.getRedirectUrl(HearingOutcomeCode[hearingOutcome], adjudicationNumber, hearingId)
    const redirectUrl = `${redirectUrlPrefix}?adjudicatorName=${adjudicatorName}&hearingOutcome=${hearingOutcome}`
    return res.redirect(redirectUrl)
  }
}
