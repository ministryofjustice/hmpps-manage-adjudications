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
import { User } from '../../../data/hmppsAuthClient'
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/hearingOutcome/pleaAndFinding.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      hearingPlea,
      hearingFinding,
      adjudicatorName: adjudicatorNameFromApi,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let readApiHearingOutcome = null
    if (this.pageOptions.isEdit()) {
      const lastOutcomeItem = (await this.reportedAdjudicationsService.getLastOutcomeItem(
        adjudicationNumber,
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
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
      const redirectUrl = this.getRedirectUrl(isEdit, HearingOutcomeFinding[hearingFinding], adjudicationNumber)
      return res.redirect(
        url.format({
          pathname: redirectUrl,
          query: { adjudicator: String(nameOfAdjudicator), plea: hearingPlea },
        })
      )
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
      throw postError
    }
  }

  getPreviouslyEnteredHearingOutcomeFromApi = async (
    adjudicationId: number,
    user: User
  ): Promise<HearingOutcomeDetails> => {
    return this.hearingsService.getHearingOutcome(adjudicationId, user)
  }

  getRedirectUrl = (isEdit: boolean, hearingFinding: HearingOutcomeFinding, adjudicationNumber: number) => {
    if (isEdit) {
      if (hearingFinding === HearingOutcomeFinding.CHARGE_PROVED)
        return adjudicationUrls.moneyRecoveredForDamages.urls.edit(adjudicationNumber)
      if (hearingFinding === HearingOutcomeFinding.DISMISSED)
        return adjudicationUrls.hearingReasonForFinding.urls.edit(adjudicationNumber)
      return adjudicationUrls.reasonForNotProceeding.urls.completeHearingEdit(adjudicationNumber)
    }
    if (hearingFinding === HearingOutcomeFinding.CHARGE_PROVED)
      return adjudicationUrls.moneyRecoveredForDamages.urls.start(adjudicationNumber)
    if (hearingFinding === HearingOutcomeFinding.DISMISSED)
      return adjudicationUrls.hearingReasonForFinding.urls.start(adjudicationNumber)
    return adjudicationUrls.reasonForNotProceeding.urls.completeHearingStart(adjudicationNumber)
  }
}
