/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import {
  HearingDetailsHistory,
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
} from '../../../data/HearingAndOutcomeResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './hearingAdjournValidation'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

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
    private readonly userService: UserService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
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

    let readApi = null
    if (this.pageOptions.isEdit()) {
      const lastOutcomeItem = (await this.reportedAdjudicationsService.getLastOutcomeItem(
        adjudicationNumber,
        user
      )) as HearingDetailsHistory
      readApi = lastOutcomeItem.hearing.outcome
    }

    return this.renderView(req, res, {
      adjournReason: readApi?.reason,
      adjournDetails: readApi?.details,
      adjournPlea: readApi?.plea,
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
      if (this.pageOptions.isEdit()) {
        await this.hearingsService.editAdjournHearingOutcome(
          adjudicationNumber,
          adjournDetails,
          adjournReason,
          adjournPlea,
          user,
          adjudicator as string
        )
      } else {
        await this.hearingsService.createAdjourn(
          adjudicationNumber,
          HearingOutcomeCode.ADJOURN,
          adjudicator as string,
          adjournDetails,
          adjournReason,
          adjournPlea,
          user
        )
      }

      return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
