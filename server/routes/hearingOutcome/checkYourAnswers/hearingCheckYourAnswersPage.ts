/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'

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
    const { adjudicator, plea, finding } = req.query
    // if the data has been lost, they need to restart this journey
    if (!plea || !adjudicator || !finding) {
      return res.redirect(adjudicationUrls.hearingDetails.urls.review(chargeNumber))
    }

    const changeHref = url.format({
      pathname: adjudicationUrls.hearingPleaAndFinding.urls.start(chargeNumber),
      query: { adjudicator: String(adjudicator), previousPlea: String(plea), previousFinding: String(finding) },
    })

    return res.render(`pages/hearingOutcome/hearingCheckAnswers.njk`, {
      plea,
      finding,
      changeHref,
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
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
    const { plea, adjudicator } = req.query

    // if the plea or adjudicator has been lost, they need to restart this journey
    if (!plea || !adjudicator) return res.redirect(adjudicationUrls.hearingDetails.urls.review(chargeNumber))

    try {
      if (this.pageOptions.isEdit()) {
        await this.hearingsService.editChargeProvedOutcome(
          chargeNumber,
          user,
          (adjudicator && (adjudicator as string)) || null,
          (plea && HearingOutcomePlea[plea.toString()]) || null
        )
      } else {
        await this.hearingsService.createChargedProvedHearingOutcome(
          chargeNumber,
          adjudicator as string,
          HearingOutcomePlea[plea as string],
          user
        )
      }

      const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
      if (adjudication.reportedAdjudication.punishments.length !== 0) {
        return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
      }
      return res.redirect(adjudicationUrls.awardPunishments.urls.start(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingsCheckAnswers.urls.start(chargeNumber)
      throw postError
    }
  }
}
