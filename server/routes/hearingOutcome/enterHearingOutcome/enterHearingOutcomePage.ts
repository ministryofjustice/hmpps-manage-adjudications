/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import { HearingOutcomeCode, HearingOutcomeDetails } from '../../../data/HearingResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './hearingOutcomeValidation'
import { User } from '../../../data/hmppsAuthClient'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  hearingOutcome?: HearingOutcomeCode
  adjudicatorName?: string
  readApiHearingOutcome?: HearingOutcomeDetails
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class EnterHearingOutcomePage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly hearingsService: HearingsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private getRedirectUrl = (outcome: HearingOutcomeCode, adjudicationNumber: number, hearingId: number) => {
    if (this.pageOptions.isEdit()) {
      switch (outcome) {
        case HearingOutcomeCode.ADJOURN:
          return adjudicationUrls.hearingAdjourned.urls.edit(adjudicationNumber, hearingId)
        case HearingOutcomeCode.COMPLETE:
          return adjudicationUrls.hearingPleaAndFinding.urls.edit(adjudicationNumber, hearingId)
        default:
          return adjudicationUrls.hearingReasonForReferral.urls.edit(adjudicationNumber, hearingId)
      }
    }
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
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const hearingId = Number(req.params.hearingId)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let readApiHearingOutcome: HearingOutcomeDetails = null
    if (this.pageOptions.isEdit()) {
      readApiHearingOutcome = await this.getPreviouslyEnteredHearingOutcomeFromApi(adjudicationNumber, hearingId, user)
    }

    return this.renderView(req, res, {
      hearingOutcome: readApiHearingOutcome?.code,
      adjudicatorName: readApiHearingOutcome?.adjudicator,
    })
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

  getPreviouslyEnteredHearingOutcomeFromApi = async (
    adjudicationId: number,
    hearingId: number,
    user: User
  ): Promise<HearingOutcomeDetails> => {
    return this.hearingsService.getHearingOutcome(adjudicationId, hearingId, user)
  }
}