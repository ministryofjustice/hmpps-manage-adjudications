/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import { HearingOutcomeCode, HearingOutcomeDetails } from '../../../data/HearingAndOutcomeResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './hearingReasonForReferralValidation'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  referralReason?: string
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class HearingReasonForReferralPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly hearingsService: HearingsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, referralReason } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/hearingOutcome/reasonForReferral.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      referralReason,
    })
  }

  private validDataFromEnterHearingOutcomePage = (hearingOutcome: HearingOutcomeCode, adjudicatorName: string) => {
    if (
      !hearingOutcome ||
      !adjudicatorName ||
      ![HearingOutcomeCode.REFER_INAD, HearingOutcomeCode.REFER_POLICE].includes(hearingOutcome)
    )
      return false
    return true
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const hearingId = Number(req.params.hearingId)
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let readApiHearingOutcome: HearingOutcomeDetails = null
    if (this.pageOptions.isEdit()) {
      readApiHearingOutcome = await this.hearingsService.getHearingOutcome(adjudicationNumber, hearingId, user)
    }

    return this.renderView(req, res, {
      referralReason: readApiHearingOutcome?.details,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const hearingId = Number(req.params.hearingId)
    const { hearingOutcome, adjudicatorName } = req.query
    const { referralReason } = req.body

    const isEdit = this.pageOptions.isEdit()

    const error = validateForm({ referralReason })
    if (error)
      return this.renderView(req, res, {
        error,
        referralReason,
      })

    // We need to check the data from previous page hasn't been lost/tampered with
    if (!this.validDataFromEnterHearingOutcomePage(hearingOutcome as HearingOutcomeCode, adjudicatorName as string)) {
      if (isEdit) return res.redirect(adjudicationUrls.enterHearingOutcome.urls.edit(adjudicationNumber, hearingId))
      return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber, hearingId))
    }

    try {
      await this.hearingsService.createReferral(
        adjudicationNumber,
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
