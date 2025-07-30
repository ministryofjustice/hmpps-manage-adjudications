/* eslint-disable max-classes-per-file */

import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import { HearingOutcomePlea } from '../../data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
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
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, notProceedReason, notProceedDetails } = pageData

    return res.render(`pages/notProceed.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      errors: error ? [error] : [],
      notProceedReason,
      notProceedDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let reason = null
    let details = null

    if (this.pageOptions.isEdit()) {
      try {
        const lastOutcomeItem = await this.reportedAdjudicationsService.getLastOutcomeItem(
          chargeNumber,
          [ReportedAdjudicationStatus.NOT_PROCEED],
          res.locals.user,
        )

        if (lastOutcomeItem.outcome?.outcome.reason) {
          reason = lastOutcomeItem.outcome.outcome.reason
        }
        if (lastOutcomeItem.outcome?.outcome.details) {
          details = lastOutcomeItem.outcome.outcome.details
        }
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
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
    const { chargeNumber } = req.params
    const { notProceedReason, notProceedDetails } = req.body
    const { adjudicator, plea } = req.query

    const details = notProceedDetails ? notProceedDetails.trim() : null

    const error = validateForm({ notProceedReason, notProceedDetails: details })
    if (error) return this.renderView(req, res, { error, notProceedReason, notProceedDetails: details })
    try {
      if (this.pageOptions.isCompleteHearing()) {
        if (
          !this.pageOptions.isEdit() &&
          !this.validateDataFromEnterHearingOutcomePage(plea as HearingOutcomePlea, adjudicator as string)
        ) {
          return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(chargeNumber))
        }
        if (this.pageOptions.isEdit()) {
          await this.hearingsService.editNotProceedHearingOutcome(
            chargeNumber,
            notProceedReason,
            details,
            user,
            (adjudicator && (adjudicator as string)) || null,
            (plea && HearingOutcomePlea[plea.toString() as keyof typeof HearingOutcomePlea]) || null,
          )
        } else {
          await this.hearingsService.createNotProceedHearingOutcome(
            chargeNumber,
            adjudicator as string,
            plea as HearingOutcomePlea,
            notProceedReason,
            details,
            user,
          )
        }
      } else if (this.pageOptions.isEdit()) {
        await this.outcomesService.editNotProceedOutcome(chargeNumber, notProceedReason, details, user)
      } else {
        await this.outcomesService.createNotProceed(chargeNumber, notProceedReason, details, user)
      }
      return res.redirect(adjudicationUrls.hearingDetails.urls.review(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
      throw postError
    }
  }

  private validateDataFromEnterHearingOutcomePage = (plea: HearingOutcomePlea, adjudicator: string) => {
    if (!plea || !adjudicator) return false
    return true
  }
}
