/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { hasAnyRole } from '../../../../utils/utils'
import validateForm from '../hearingReasonForReferralValidation'
import OutcomesService from '../../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { ReportedAdjudicationStatus } from '../../../../data/ReportedAdjudicationResult'

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

export default class ReasonForReferralPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly outcomesService: OutcomesService,
    private readonly userService: UserService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, referralReason } = pageData
    const { chargeNumber } = req.params

    return res.render(`pages/hearingOutcome/reasonForReferral.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      errors: error ? [error] : [],
      referralReason,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let refOutcome = null
    if (this.pageOptions.isEdit()) {
      const lastOutcomeItem = await this.reportedAdjudicationsService.getLastOutcomeItem(
        chargeNumber,
        [ReportedAdjudicationStatus.REFER_POLICE],
        user
      )
      refOutcome = lastOutcomeItem.outcome?.outcome
    }

    return this.renderView(req, res, {
      referralReason: refOutcome?.details,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const { referralReason } = req.body

    const error = validateForm({ referralReason, referGovReasonPresent: false })
    if (error)
      return this.renderView(req, res, {
        error,
        referralReason,
      })

    try {
      if (this.pageOptions.isEdit()) {
        await this.outcomesService.editReferralOutcome(chargeNumber, referralReason, user)
      } else {
        await this.outcomesService.createPoliceReferral(chargeNumber, referralReason, user)
      }
      return res.redirect(adjudicationUrls.hearingReferralConfirmation.urls.start(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
      throw postError
    }
  }
}
