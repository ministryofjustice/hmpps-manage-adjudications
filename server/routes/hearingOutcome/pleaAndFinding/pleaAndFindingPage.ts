/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import { HearingOutcomeDetails, HearingOutcomeFinding, HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './pleaAndFindingValidation'
import { User } from '../../../data/hmppsAuthClient'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  hearingPlea: HearingOutcomePlea
  hearingFinding: HearingOutcomeFinding
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class PleaAndFindingPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly hearingsService: HearingsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, hearingPlea, hearingFinding } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/hearingOutcome/pleaAndFinding.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      hearingPlea,
      hearingFinding,
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
      hearingPlea: readApiHearingOutcome?.plea,
      hearingFinding: readApiHearingOutcome?.finding,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const hearingId = Number(req.params.hearingId)
    const { hearingPlea, hearingFinding } = req.body
    const isEdit = this.pageOptions.isEdit()

    const error = validateForm({ hearingPlea, hearingFinding })
    if (error)
      return this.renderView(req, res, {
        error,
        hearingPlea,
        hearingFinding,
      })

    try {
      const redirectUrl = this.getRedirectUrl(
        isEdit,
        HearingOutcomeFinding[hearingFinding],
        adjudicationNumber,
        hearingId
      )
      return res.redirect(redirectUrl)
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }

  getPreviouslyEnteredHearingOutcomeFromApi = async (
    adjudicationId: number,
    hearingId: number,
    user: User
  ): Promise<HearingOutcomeDetails> => {
    return this.hearingsService.getHearingOutcome(adjudicationId, hearingId, user)
  }

  getRedirectUrl = (
    isEdit: boolean,
    hearingFinding: HearingOutcomeFinding,
    adjudicationNumber: number,
    hearingId: number
  ) => {
    if (isEdit) {
      if (hearingFinding === HearingOutcomeFinding.PROVED)
        return adjudicationUrls.moneyRecoveredForDamages.urls.edit(adjudicationNumber)
      if (hearingFinding === HearingOutcomeFinding.DISMISSED)
        return adjudicationUrls.hearingReasonForFinding.urls.edit(adjudicationNumber, hearingId)
      return adjudicationUrls.reasonForNotProceeding.urls.edit(adjudicationNumber)
    }
    if (hearingFinding === HearingOutcomeFinding.PROVED)
      return adjudicationUrls.moneyRecoveredForDamages.urls.start(adjudicationNumber)
    if (hearingFinding === HearingOutcomeFinding.DISMISSED)
      return adjudicationUrls.hearingReasonForFinding.urls.start(adjudicationNumber, hearingId)
    return adjudicationUrls.reasonForNotProceeding.urls.start(adjudicationNumber)
  }
}
