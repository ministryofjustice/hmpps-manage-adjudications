/* eslint-disable max-classes-per-file */

import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './cautionValidation'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'

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

export default class CautionPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, caution: string, error: FormError | null): Promise<void> => {
    const { chargeNumber } = req.params

    return res.render(`pages/caution.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      errors: error ? [error] : [],
      caution,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let caution = ''

    if (this.pageOptions.isEdit()) {
      try {
        const lastOutcomeItem = await this.reportedAdjudicationsService.getLastOutcomeItem(
          chargeNumber,
          [ReportedAdjudicationStatus.CHARGE_PROVED],
          res.locals.user
        )
        if (lastOutcomeItem.outcome?.outcome.caution != null) {
          caution = lastOutcomeItem.outcome.outcome.caution ? 'yes' : 'no'
        }
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
        throw postError
      }
    }

    return this.renderView(req, res, caution, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { caution } = req.body
    const { plea, adjudicator, amount, damagesOwed } = req.query
    // const { user } = res.locals

    const error = validateForm({ caution })
    if (error) return this.renderView(req, res, caution, error)

    try {
      if (
        !this.pageOptions.isEdit() &&
        !this.validateDataFromEnterHearingOutcomePage(plea as HearingOutcomePlea, adjudicator as string)
      ) {
        return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(chargeNumber))
      }

      let path = adjudicationUrls.hearingsCheckAnswers.urls.start(chargeNumber)

      if (this.pageOptions.isEdit()) {
        path = adjudicationUrls.hearingsCheckAnswers.urls.edit(chargeNumber)
      }

      return res.redirect(
        url.format({
          pathname: path,
          query: {
            adjudicator: adjudicator as string,
            amount: amount as string,
            plea: plea as string,
            damagesOwed: damagesOwed ? Boolean(damagesOwed) : null,
            caution,
          },
        })
      )
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
