/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { datePickerToApi, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { NotCompletedOutcome, RehabilitativeActivity } from '../../../../data/PunishmentResult'

type PageData = {
  completed?: string
  prisonerName: string
  outcome?: NotCompletedOutcome
  daysToActivate?: number
  suspendedUntil?: string
}

export default class ConfirmCompleteRehabilitativeActivityPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { prisonerName, outcome, completed, daysToActivate, suspendedUntil } = pageData

    return res.render(`pages/confirmRehabCompletion.njk`, {
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, id } = req.params
    const { user } = res.locals

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const { completed, prisonerName } = await this.punishmentsService.getRehabilitativeActivitiesCompletionDetails(
      chargeNumber,
      +id,
      user
    )

    return this.renderView(req, res, {
      prisonerName,
      completed,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, id } = req.params
    const { completed } = req.body
    const { user } = res.locals
    const { outcome, daysToActivate, suspendedUntil } = req.body

    try {
      if (completed === 'YES') {
        await this.punishmentsService.completeRehabilitativeActivity(chargeNumber, +id, completed === 'YES', user)
        return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber))
      }
      await this.punishmentsService.completeRehabilitativeActivity(
        chargeNumber,
        +id,
        false,
        user,
        outcome,
        +daysToActivate,
        suspendedUntil ? datePickerToApi(suspendedUntil) : null
      )
      return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
      throw postError
    }
  }
}
