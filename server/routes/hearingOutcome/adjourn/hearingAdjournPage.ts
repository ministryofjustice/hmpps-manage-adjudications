/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomeDetails,
  HearingOutcomePlea,
} from '../../../data/HearingAndOutcomeResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './hearingAdjournValidation'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  adjournReason: HearingOutcomeAdjournReason
  adjournDetails: string
  adjournPlea: HearingOutcomePlea
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class HearingAdournedPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly hearingsService: HearingsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, adjournReason, adjournDetails, adjournPlea } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/hearingOutcome/adjourn.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      adjournReason,
      adjournDetails,
      adjournPlea,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let readApiHearingOutcome: HearingOutcomeDetails = null
    if (this.pageOptions.isEdit()) {
      readApiHearingOutcome = await this.hearingsService.getHearingOutcome(adjudicationNumber, user)
    }

    return this.renderView(req, res, {
      adjournReason: readApiHearingOutcome?.reason,
      adjournDetails: readApiHearingOutcome?.details,
      adjournPlea: readApiHearingOutcome?.plea,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { adjudicator } = req.query
    const { adjournReason, adjournDetails, adjournPlea } = req.body

    const error = validateForm({ adjournReason, adjournDetails, adjournPlea })
    if (error)
      return this.renderView(req, res, {
        error,
        adjournReason,
        adjournDetails,
        adjournPlea,
      })

    try {
      await this.hearingsService.createAdjourn(
        adjudicationNumber,
        HearingOutcomeCode.ADJOURN,
        adjudicator as string,
        adjournDetails,
        adjournReason,
        adjournPlea,
        user
      )

      return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
