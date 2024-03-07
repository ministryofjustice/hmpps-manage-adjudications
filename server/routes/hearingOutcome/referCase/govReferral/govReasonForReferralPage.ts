/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'

import UserService from '../../../../services/userService'
import { HearingDetailsHistory, ReferGovReason } from '../../../../data/HearingAndOutcomeResult'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { hasAnyRole } from '../../../../utils/utils'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { ReportedAdjudicationStatus } from '../../../../data/ReportedAdjudicationResult'
import validateForm from './govReasonForReferralValidation'
import OutcomesService from '../../../../services/outcomesService'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  referralReason?: string
  referGovReason?: ReferGovReason
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class GovReasonForReferralPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly outcomesService: OutcomesService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, referralReason, referGovReason } = pageData
    const { chargeNumber } = req.params
    return res.render(`pages/hearingOutcome/reasonForGovReferral.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      errors: error ? [error] : [],
      referralReason,
      referGovReason,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    let referralOutcome = null
    if (this.pageOptions.isEdit()) {
      const lastOutcomeItem = (await this.reportedAdjudicationsService.getLastOutcomeItem(
        chargeNumber,
        [ReportedAdjudicationStatus.REFER_GOV],
        user
      )) as HearingDetailsHistory
      referralOutcome = lastOutcomeItem.outcome.referralOutcome
    }
    return this.renderView(req, res, {
      referralReason: referralOutcome?.details,
      referGovReason: referralOutcome?.referGovReason,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const { referralReason, referGovReason } = req.body
    const trimmedReferralReason = referralReason ? referralReason.trim() : null
    const error = validateForm({ referralReason: trimmedReferralReason, referGovReason })
    if (error)
      return this.renderView(req, res, {
        error,
        referralReason: trimmedReferralReason,
        referGovReason,
      })
    try {
      if (this.pageOptions.isEdit()) {
        await this.outcomesService.editReferralOutcome(chargeNumber, trimmedReferralReason, referGovReason, user)
      } else {
        await this.outcomesService.createGovReferral(chargeNumber, trimmedReferralReason, referGovReason, user)
      }
      return res.redirect(adjudicationUrls.hearingReferralConfirmation.urls.start(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
      throw postError
    }
  }
}
