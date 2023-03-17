/* eslint-disable max-classes-per-file */

import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import { HearingOutcomePlea } from '../../data/HearingAndOutcomeResult'
import HearingsService from '../../services/hearingsService'
import OutcomesService from '../../services/outcomesService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { hasAnyRole } from '../../utils/utils'
import validateForm from './notProceedValidation'

type PageData = {
  error?: FormError
  notProceedReason?: string
  notProceedDetails?: string
}

export enum PageRequestType {
  REFER_AND_NO_HEARING,
  REFER_AND_NO_HEARING_EDIT,
  COMPLETE_HEARING,
  COMPLETE_HEARING_EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isCompleteHearing(): boolean {
    return [PageRequestType.COMPLETE_HEARING_EDIT, PageRequestType.COMPLETE_HEARING].includes(this.pageType)
  }

  isEdit(): boolean {
    return [PageRequestType.COMPLETE_HEARING_EDIT, PageRequestType.REFER_AND_NO_HEARING_EDIT].includes(this.pageType)
  }
}

export default class NotProceedPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly outcomesService: OutcomesService,
    private readonly hearingsService: HearingsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { error, notProceedReason, notProceedDetails } = pageData

    return res.render(`pages/notProceed.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      notProceedReason,
      notProceedDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let reason = null
    let details = null

    if (this.pageOptions.isEdit()) {
      try {
        const { outcome } = await this.reportedAdjudicationsService.getLastOutcomeItem(
          adjudicationNumber,
          res.locals.user
        )
        if (outcome.outcome.reason) {
          reason = outcome.outcome.reason
        }
        if (outcome.outcome.details) {
          details = outcome.outcome.details
        }
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
        throw postError
      }
    }

    return this.renderView(req, res, {
      notProceedReason: reason,
      notProceedDetails: details,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { notProceedReason, notProceedDetails } = req.body
    const { adjudicator, plea } = req.query

    const error = validateForm({ notProceedReason, notProceedDetails })
    if (error) return this.renderView(req, res, { error, notProceedReason, notProceedDetails })
    try {
      if (this.pageOptions.isCompleteHearing()) {
        if (
          !this.pageOptions.isEdit() &&
          !this.validateDataFromEnterHearingOutcomePage(plea as HearingOutcomePlea, adjudicator as string)
        ) {
          return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber))
        }
        if (this.pageOptions.isEdit()) {
          await this.hearingsService.editNotProceedHearingOutcome(
            adjudicationNumber,
            notProceedReason,
            notProceedDetails,
            user,
            (adjudicator && (adjudicator as string)) || null,
            (plea && HearingOutcomePlea[plea.toString()]) || null
          )
        } else {
          await this.hearingsService.createNotProceedHearingOutcome(
            adjudicationNumber,
            adjudicator as string,
            plea as HearingOutcomePlea,
            notProceedReason,
            notProceedDetails,
            user
          )
        }
      } else if (this.pageOptions.isEdit()) {
        await this.outcomesService.editNotProceedOutcome(adjudicationNumber, notProceedReason, notProceedDetails, user)
      } else {
        await this.outcomesService.createNotProceed(adjudicationNumber, notProceedReason, notProceedDetails, user)
      }
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
