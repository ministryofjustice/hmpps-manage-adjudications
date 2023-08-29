/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import { HearingDetailsHistory, HearingOutcomeCode } from '../../../data/HearingAndOutcomeResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './hearingReasonForReferralValidation'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  referralReason?: string
  hearingOutcomeCode?: HearingOutcomeCode
  referGov?: boolean
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
    private readonly userService: UserService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, referralReason, hearingOutcomeCode, referGov } = pageData
    const { chargeNumber } = req.params

    return res.render(`pages/hearingOutcome/reasonForReferral.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      errors: error ? [error] : [],
      referralReason,
      hearingOutcomeCode,
      referGov,
    })
  }

  private validDataFromEnterHearingOutcomePage = (hearingOutcome: HearingOutcomeCode, adjudicatorName: string) => {
    if (
      !hearingOutcome ||
      !adjudicatorName ||
      ![HearingOutcomeCode.REFER_INAD, HearingOutcomeCode.REFER_POLICE, HearingOutcomeCode.REFER_GOV].includes(
        hearingOutcome
      )
    )
      return false
    return true
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let hearingOutcome = null
    if (this.pageOptions.isEdit()) {
      const lastOutcomeItem = (await this.reportedAdjudicationsService.getLastOutcomeItem(
        chargeNumber,
        [
          ReportedAdjudicationStatus.REFER_INAD,
          ReportedAdjudicationStatus.REFER_POLICE,
          ReportedAdjudicationStatus.REFER_GOV,
        ],
        user
      )) as HearingDetailsHistory
      hearingOutcome = lastOutcomeItem.hearing?.outcome
    }
    return this.renderView(req, res, {
      referralReason: hearingOutcome?.details,
      hearingOutcomeCode: hearingOutcome?.code,
      referGov: req.query.hearingOutcome === HearingOutcomeCode.REFER_GOV,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const { hearingOutcome, adjudicator } = req.query
    const { referralReason, hearingOutcomeCode } = req.body

    const isEdit = this.pageOptions.isEdit()
    const trimmedReferralReason = referralReason ? referralReason.trim() : null

    const error = validateForm({ referralReason: trimmedReferralReason })
    if (error)
      return this.renderView(req, res, {
        error,
        referralReason: trimmedReferralReason,
        referGov: hearingOutcome === HearingOutcomeCode.REFER_GOV,
      })

    try {
      if (isEdit) {
        // Use whatever code is in the query, if there, if not use data from api
        const outcomeCode = hearingOutcome || hearingOutcomeCode

        await this.hearingsService.editReferralHearingOutcome(
          chargeNumber,
          outcomeCode as HearingOutcomeCode,
          trimmedReferralReason,
          user,
          adjudicator as string
        )
      } else {
        // We need to check the data from previous page hasn't been lost/tampered with
        if (!this.validDataFromEnterHearingOutcomePage(hearingOutcome as HearingOutcomeCode, adjudicator as string)) {
          return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(chargeNumber))
        }

        await this.hearingsService.createReferral(
          chargeNumber,
          hearingOutcome as HearingOutcomeCode,
          adjudicator as string,
          trimmedReferralReason,
          user
        )
      }

      return res.redirect(adjudicationUrls.hearingReferralConfirmation.urls.start(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
      throw postError
    }
  }
}
