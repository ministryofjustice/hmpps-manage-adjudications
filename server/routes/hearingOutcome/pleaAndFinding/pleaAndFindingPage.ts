/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import { FormError } from '../../../@types/template'

import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import {
  HearingDetailsHistory,
  HearingOutcomeDetails,
  HearingOutcomeFinding,
  HearingOutcomePlea,
} from '../../../data/HearingAndOutcomeResult'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './pleaAndFindingValidation'
import { User } from '../../../data/hmppsManageUsersClient'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  hearingPlea?: HearingOutcomePlea
  hearingFinding?: HearingOutcomeFinding
  adjudicatorNameFromApi?: string
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
    private readonly hearingsService: HearingsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, hearingPlea, hearingFinding, adjudicatorNameFromApi } = pageData
    const { chargeNumber } = req.params
    return res.render(`pages/hearingOutcome/pleaAndFinding.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      errors: error ? [error] : [],
      hearingPlea,
      hearingFinding,
      adjudicatorName: adjudicatorNameFromApi,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    const { chargeNumber } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let readApiHearingOutcome = null
    if (this.pageOptions.isEdit()) {
      const lastOutcomeItem = (await this.reportedAdjudicationsService.getLastOutcomeItem(
        chargeNumber,
        [
          ReportedAdjudicationStatus.DISMISSED,
          ReportedAdjudicationStatus.CHARGE_PROVED,
          ReportedAdjudicationStatus.NOT_PROCEED,
        ],
        user
      )) as HearingDetailsHistory
      readApiHearingOutcome = {
        plea: lastOutcomeItem.hearing?.outcome.plea,
        finding: lastOutcomeItem.outcome?.outcome.code as unknown as HearingOutcomeFinding,
        adjudicatorNameFromApi: lastOutcomeItem.hearing?.outcome.adjudicator,
      }
    }
    const pageData = !readApiHearingOutcome
      ? {}
      : {
          hearingPlea: readApiHearingOutcome.plea,
          hearingFinding: readApiHearingOutcome.finding,
          adjudicatorNameFromApi: readApiHearingOutcome.adjudicatorNameFromApi,
        }

    return this.renderView(req, res, pageData)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { hearingPlea, hearingFinding, adjudicatorName } = req.body
    const isEdit = this.pageOptions.isEdit()
    const { adjudicator } = req.query

    const error = validateForm({ hearingPlea, hearingFinding })
    if (error)
      return this.renderView(req, res, {
        error,
        hearingPlea,
        hearingFinding,
      })

    const nameOfAdjudicator = adjudicator || adjudicatorName

    try {
      const redirectUrl = this.getRedirectUrl(isEdit, HearingOutcomeFinding[hearingFinding], chargeNumber)
      return res.redirect(
        url.format({
          pathname: redirectUrl,
          query: { adjudicator: String(nameOfAdjudicator), plea: hearingPlea },
        })
      )
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
      throw postError
    }
  }

  getPreviouslyEnteredHearingOutcomeFromApi = async (
    chargeNumber: string,
    user: User
  ): Promise<HearingOutcomeDetails> => {
    return this.hearingsService.getHearingOutcome(chargeNumber, user)
  }

  getRedirectUrl = (isEdit: boolean, hearingFinding: HearingOutcomeFinding, chargeNumber: string) => {
    if (isEdit) {
      if (hearingFinding === HearingOutcomeFinding.CHARGE_PROVED)
        return adjudicationUrls.moneyRecoveredForDamages.urls.edit(chargeNumber)
      if (hearingFinding === HearingOutcomeFinding.DISMISSED)
        return adjudicationUrls.hearingReasonForFinding.urls.edit(chargeNumber)
      return adjudicationUrls.reasonForNotProceeding.urls.completeHearingEdit(chargeNumber)
    }
    if (hearingFinding === HearingOutcomeFinding.CHARGE_PROVED)
      return adjudicationUrls.moneyRecoveredForDamages.urls.start(chargeNumber)
    if (hearingFinding === HearingOutcomeFinding.DISMISSED)
      return adjudicationUrls.hearingReasonForFinding.urls.start(chargeNumber)
    return adjudicationUrls.reasonForNotProceeding.urls.completeHearingStart(chargeNumber)
  }
}
