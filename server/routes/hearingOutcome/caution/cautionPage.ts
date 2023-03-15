/* eslint-disable max-classes-per-file */

import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import HearingsService from '../../../services/hearingsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './cautionValidation'

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
    private readonly hearingsService: HearingsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response, caution: string, error: FormError | null): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/caution.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      caution,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let caution = ''

    if (this.pageOptions.isEdit()) {
      try {
        const { outcome } = await this.reportedAdjudicationsService.getLastOutcomeItem(
          adjudicationNumber,
          res.locals.user
        )
        if (outcome.outcome.caution != null) {
          caution = outcome.outcome.caution ? 'yes' : 'no'
        }
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
        throw postError
      }
    }

    return this.renderView(req, res, caution, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { caution } = req.body
    const { plea, adjudicator, amount } = req.query
    const { user } = res.locals

    const error = validateForm({ caution })
    if (error) return this.renderView(req, res, caution, error)

    try {
      if (
        !this.pageOptions.isEdit() &&
        !this.validateDataFromEnterHearingOutcomePage(plea as HearingOutcomePlea, adjudicator as string)
      ) {
        return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber))
      }

      const actualAmount = amount as string

      if (caution === 'yes') {
        let path = adjudicationUrls.hearingsCheckAnswers.urls.start(adjudicationNumber)

        if (this.pageOptions.isEdit()) {
          path = adjudicationUrls.hearingsCheckAnswers.urls.edit(adjudicationNumber)
        }

        return res.redirect(
          url.format({
            pathname: path,
            query: { adjudicator: adjudicator as string, amount: amount as string, plea: plea as string },
          })
        )
      }

      if (this.pageOptions.isEdit()) {
        await this.hearingsService.editChargeProvedOutcome(
          adjudicationNumber,
          false,
          user,
          (adjudicator && (adjudicator as string)) || null,
          (plea && HearingOutcomePlea[plea.toString()]) || null,
          !actualAmount ? null : actualAmount
        )
      } else {
        await this.hearingsService.createChargedProvedHearingOutcome(
          adjudicationNumber,
          adjudicator as string,
          HearingOutcomePlea[plea.toString()],
          false,
          user,
          !actualAmount ? null : actualAmount
        )
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
