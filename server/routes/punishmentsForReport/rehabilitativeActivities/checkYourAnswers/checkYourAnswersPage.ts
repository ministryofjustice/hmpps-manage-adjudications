/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import moment from 'moment'
import UserService from '../../../../services/userService'
import { datePickerToApi, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { NotCompletedOutcome } from '../../../../data/PunishmentResult'

type PageData = {
  completed?: string
  prisonerName: string
  outcome?: NotCompletedOutcome
  daysToActivate?: number
  actualDays: number
  suspendedUntil?: string
}

export default class CheckYourAnswersCompleteRehabilitativeActivityPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber, id } = req.params
    const { prisonerName, outcome, completed, daysToActivate, suspendedUntil, actualDays } = pageData

    let details = ''

    if (!completed) {
      switch (outcome) {
        case NotCompletedOutcome.FULL_ACTIVATE:
          details = `Activate it in full: ${actualDays} days`
          break
        case NotCompletedOutcome.PARTIAL_ACTIVATE:
          details = `Activate for a different number of days: ${daysToActivate} days`
          break
        case NotCompletedOutcome.EXT_SUSPEND:
          details = `Suspend it for longer: to ${moment(suspendedUntil).format('D MMM YYYY')}`
          break
        case NotCompletedOutcome.NO_ACTION:
          details = 'No action'
          break
        default:
          break
      }
    }

    return res.render(`pages/confirmRehabCompletion.njk`, {
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      prisonerName,
      completed: completed ? 'Yes' : 'No',
      details,
      changeCompletedLink: adjudicationUrls.completeRehabilitativeActivity.urls.start(chargeNumber, +id),
      changeOutcomeLink: adjudicationUrls.incompleteRehabilitativeActivity.urls.start(chargeNumber, +id),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, id } = req.params
    const { user } = res.locals

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const { completed, prisonerName, outcome, daysToActivate, suspendedUntil, actualDays } =
      await this.punishmentsService.getRehabilitativeActivitiesCompletionDetails(req, chargeNumber, +id, user)

    return this.renderView(req, res, {
      prisonerName,
      completed,
      daysToActivate,
      suspendedUntil,
      outcome,
      actualDays,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, id } = req.params
    const { user } = res.locals
    const { completed, outcome, daysToActivate, suspendedUntil } =
      await this.punishmentsService.getRehabilitativeActivitiesCompletionDetails(req, chargeNumber, +id, user)

    try {
      await this.punishmentsService.completeRehabilitativeActivity(
        chargeNumber,
        +id,
        Boolean(completed),
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
