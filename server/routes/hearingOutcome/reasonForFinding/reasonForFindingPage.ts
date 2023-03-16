/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './reasonForFindingValidation'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'

type PageData = {
  error?: FormError | FormError[]
  reasonForFinding?: string
}

export enum PageRequestType {
  CREATION,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class ReasonForFindingPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly hearingsService: HearingsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, reasonForFinding } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/hearingOutcome/reasonForFinding.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      reasonForFinding,
    })
  }

  private validateQueryData = (adjudicator: string, plea: HearingOutcomePlea) => {
    if (!adjudicator || !plea || !HearingOutcomePlea[plea]) return false
    return true
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const userRoles = await this.userService.getUserRoles(user.token)

    let reasonForFinding = null

    if (this.pageOptions.isEdit()) {
      try {
        const { outcome } = await this.reportedAdjudicationsService.getLastOutcomeItem(
          adjudicationNumber,
          res.locals.user
        )
        if (outcome.outcome.details) {
          reasonForFinding = outcome.outcome.details
        }
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
        throw postError
      }
    }

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {
      reasonForFinding,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { reasonForFinding } = req.body
    const { adjudicator, plea } = req.query

    const error = validateForm({ reasonForFinding })
    if (error)
      return this.renderView(req, res, {
        error,
        reasonForFinding,
      })

    if (!this.pageOptions.isEdit() && !this.validateQueryData(adjudicator as string, plea as HearingOutcomePlea)) {
      return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber))
    }

    try {
      if (this.pageOptions.isEdit()) {
        await this.hearingsService.editDismissedOutcome(
          adjudicationNumber,
          reasonForFinding,
          user,
          (adjudicator && (adjudicator as string)) || null,
          (plea && HearingOutcomePlea[plea.toString()]) || null
        )
      } else {
        await this.hearingsService.createDismissedHearingOutcome(
          adjudicationNumber,
          adjudicator as string,
          plea as HearingOutcomePlea,
          reasonForFinding,
          user
        )
      }
      return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber)
      throw postError
    }
  }
}
