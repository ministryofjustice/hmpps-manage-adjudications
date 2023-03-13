import { Request, Response } from 'express'
import { HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'

export default class HearingCheckYourAnswersPage {
  constructor(private readonly hearingsService: HearingsService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { amount, adjudicator, plea } = req.query
    const actualAmount = amount as string

    const queryParamsPresent = this.validateDataFromQueryPage(plea as HearingOutcomePlea, adjudicator as string)

    return res.render(`pages/hearingOutcome/hearingCheckAnswers.njk`, {
      moneyRecoveredBoolean: queryParamsPresent ? !!amount : null,
      moneyRecoveredAmount: actualAmount,
      cautionAnswer: true,
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { plea, adjudicator, amount } = req.query
    const actualAmount = amount as string

    try {
      if (!this.validateDataFromQueryPage(plea as HearingOutcomePlea, adjudicator as string)) {
        return res.redirect(adjudicationUrls.enterHearingOutcome.urls.start(adjudicationNumber))
      }
      await this.hearingsService.createChargedProvedHearingOutcome(
        adjudicationNumber,
        adjudicator as string,
        HearingOutcomePlea[plea as string],
        true,
        user,
        !actualAmount ? null : actualAmount
      )
      return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.hearingsCheckAnswers.urls.start(adjudicationNumber)
      throw postError
    }
  }

  private validateDataFromQueryPage = (plea: HearingOutcomePlea, adjudicator: string) => {
    if (!plea || !adjudicator) return false
    return true
  }
}
