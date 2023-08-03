/* eslint-disable max-classes-per-file */

import { Request, Response } from 'express'
import config from '../../../config'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
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

export default class HearingCheckYourAnswersPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly hearingsService: HearingsService,
    private readonly userService: UserService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { amount, adjudicator, plea, caution } = req.query
    let actualAmount = amount as string
    const queryParamsPresent = this.validateDataFromQueryPage(
      plea as HearingOutcomePlea,
      adjudicator as string,
      caution as string
    )

    if (this.pageOptions.isEdit() && !actualAmount) {
      try {
        const lastOutcomeItem = await this.reportedAdjudicationsService.getLastOutcomeItem(
          chargeNumber,
          [ReportedAdjudicationStatus.CHARGE_PROVED],
          res.locals.user
        )
        if (lastOutcomeItem.outcome?.outcome.amount) {
          actualAmount = lastOutcomeItem.outcome.outcome.amount.toFixed(2)
        }
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.hearingDetails.urls.review(chargeNumber)
        throw postError
      }
    }

    return res.render(`pages/hearingOutcome/hearingCheckAnswers.njk`, {
      moneyRecoveredBoolean: queryParamsPresent ? !!amount : !!actualAmount,
      moneyRecoveredAmount: (+actualAmount).toFixed(2),
      cautionAnswer: caution === 'yes',
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      moneyChangeLinkHref: `${adjudicationUrls.moneyRecoveredForDamages.urls.start(
        chargeNumber
      )}?adjudicator=${adjudicator}&plea=${plea}`,
      cautionChangeLinkHref: `${adjudicationUrls.isThisACaution.urls.start(
        chargeNumber
      )}?adjudicator=${adjudicator}&plea=${plea}&amount=${amount}`,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { plea, adjudicator, amount, damagesOwed, caution } = req.query
    const actualAmount = amount as string

    try {
      if (
        !this.pageOptions.isEdit() &&
        !this.validateDataFromQueryPage(plea as HearingOutcomePlea, adjudicator as string, caution as string)
      ) {
        return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(chargeNumber))
      }
      if (this.pageOptions.isEdit()) {
        if (config.v2EndpointsFlag === 'true') {
          await this.hearingsService.editChargeProvedOutcomeV2(
            chargeNumber,
            user,
            (adjudicator && (adjudicator as string)) || null,
            (plea && HearingOutcomePlea[plea.toString()]) || null
          )
        } else {
          await this.hearingsService.editChargeProvedOutcome(
            chargeNumber,
            caution === 'yes',
            user,
            (adjudicator && (adjudicator as string)) || null,
            (plea && HearingOutcomePlea[plea.toString()]) || null,
            !actualAmount ? null : actualAmount,
            damagesOwed ? Boolean(damagesOwed) : null
          )
        }
      } else if (config.v2EndpointsFlag === 'true') {
        await this.hearingsService.createChargedProvedHearingOutcomeV2(
          chargeNumber,
          adjudicator as string,
          HearingOutcomePlea[plea as string],
          user
        )
      } else {
        await this.hearingsService.createChargedProvedHearingOutcome(
          chargeNumber,
          adjudicator as string,
          HearingOutcomePlea[plea as string],
          caution === 'yes',
          user,
          !actualAmount ? null : actualAmount
        )
      }

      if (caution === 'no') {
        const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
        if (adjudication.reportedAdjudication.punishments.length !== 0) {
          return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
        }
        return res.redirect(adjudicationUrls.awardPunishments.urls.start(chargeNumber))
      }

      return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingsCheckAnswers.urls.start(chargeNumber)
      throw postError
    }
  }

  private validateDataFromQueryPage = (plea: HearingOutcomePlea, adjudicator: string, caution: string) => {
    if (config.v2EndpointsFlag === 'true') {
      return true
    }
    if (!plea || !adjudicator || !caution) return false
    return true
  }
}
