/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import url from 'url'
import { FormError } from '../../../@types/template'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'

import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import validateForm from './damagesOwedValidation'
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
export default class DamagesOwedPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (
    req: Request,
    res: Response,
    damagesOwed: string,
    amount: string,
    error: FormError | null
  ): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    return res.render(`pages/damagesOwed.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      errors: error ? [error] : [],
      damagesOwed,
      amount,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    let damagesOwed = null
    let amount = null
    if (this.pageOptions.isEdit()) {
      try {
        const lastOutcomeItem = await this.reportedAdjudicationsService.getLastOutcomeItem(
          adjudicationNumber,
          [ReportedAdjudicationStatus.CHARGE_PROVED],
          res.locals.user
        )

        if (lastOutcomeItem.outcome) {
          if (lastOutcomeItem.outcome.outcome.amount) {
            amount = lastOutcomeItem.outcome.outcome.amount
            damagesOwed = 'yes'
          } else {
            damagesOwed = 'no'
          }
        }
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(adjudicationNumber)
        throw postError
      }
    }

    return this.renderView(req, res, damagesOwed, amount && amount.toFixed(2), null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { damagesOwed, amount } = req.body
    const { plea, adjudicator } = req.query

    const amountOwed = amount ? amount.trim() : null

    const error = validateForm({ damagesOwed, amount: amountOwed })
    if (error) return this.renderView(req, res, damagesOwed, amountOwed, error)

    try {
      if (
        !this.pageOptions.isEdit() &&
        !this.validateDataFromEnterHearingOutcomePage(plea as HearingOutcomePlea, adjudicator as string)
      ) {
        return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber))
      }

      let path = adjudicationUrls.isThisACaution.urls.start(adjudicationNumber)
      if (this.pageOptions.isEdit()) {
        path = adjudicationUrls.isThisACaution.urls.edit(adjudicationNumber)
      }

      return res.redirect(
        url.format({
          pathname: path,
          query: {
            adjudicator: adjudicator as string,
            plea: plea && HearingOutcomePlea[plea.toString()],
            amount: damagesOwed === 'yes' ? amountOwed : null,
            damagesOwed: damagesOwed === 'yes',
          },
        })
      )
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
