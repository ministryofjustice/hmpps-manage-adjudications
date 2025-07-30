/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './reportAQuashedGuiltyFindingValidation'
import { OutcomeDetailsHistory, QuashGuiltyFindingReason } from '../../../data/HearingAndOutcomeResult'
import OutcomesService from '../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'

export enum PageRequestType {
  CREATION,
  EDIT,
}

type PageData = {
  error?: FormError | FormError[]
  quashReason?: QuashGuiltyFindingReason
  quashDetails?: string
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class ReportAQuashedGuiltyFindingPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly userService: UserService,
    private readonly outcomesService: OutcomesService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, quashReason, quashDetails } = pageData
    const { chargeNumber } = req.params
    return res.render(`pages/hearingOutcome/reportAQuashedGuiltyFinding.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      errors: error ? [error] : [],
      quashReason,
      quashDetails,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    const { chargeNumber } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let readApi = null
    if (this.pageOptions.isEdit()) {
      const lastOutcomeItem = (await this.reportedAdjudicationsService.getLastOutcomeItem(
        chargeNumber,
        [ReportedAdjudicationStatus.QUASHED],
        user,
      )) as OutcomeDetailsHistory
      readApi = lastOutcomeItem.outcome?.outcome
    }

    return this.renderView(req, res, {
      quashReason: readApi?.quashedReason,
      quashDetails: readApi?.details,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { quashReason, quashDetails } = req.body

    const trimmedQuashDetails = quashDetails ? quashDetails.trim() : null

    const error = validateForm({ quashReason, quashDetails: trimmedQuashDetails })
    if (error)
      return this.renderView(req, res, {
        error,
        quashReason,
        quashDetails: trimmedQuashDetails,
      })

    try {
      if (this.pageOptions.isEdit()) {
        await this.outcomesService.editQuashedOutcome(chargeNumber, quashReason, trimmedQuashDetails, user)
      } else {
        await this.outcomesService.quashAGuiltyFinding(chargeNumber, quashReason, trimmedQuashDetails, user)
      }
      return res.redirect(adjudicationUrls.hearingDetails.urls.review(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
      throw postError
    }
  }
}
