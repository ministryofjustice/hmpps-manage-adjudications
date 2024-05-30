/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { apiDateToDatePicker, datePickerToApi, formatDateForDatePicker, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { FormError } from '../../../../@types/template'
import { NotCompletedOutcome } from '../../../../data/PunishmentResult'
import validateForm from './incompleteRehabilitativeActivityValidation'

type PageData = {
  error?: FormError
  prisonerName: string
  outcome: NotCompletedOutcome
  daysToActivate?: number
  suspendedUntil?: string
}

export default class IncompleteRehabilitativeActivityPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { prisonerName, error, outcome, daysToActivate, suspendedUntil } = pageData

    return res.render(`pages/incompleteRehabilitativeActivity.njk`, {
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      errors: error ? [error] : [],
      today: formatDateForDatePicker(new Date().toISOString(), 'short'),
      prisonerName,
      outcome,
      daysToActivate,
      suspendedUntil,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, id } = req.params
    const { user } = res.locals

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const { prisonerName, outcome, daysToActivate, suspendedUntil } =
      await this.punishmentsService.getRehabilitativeActivitiesCompletionDetails(req, chargeNumber, +id, user)

    // if there is an outcome already present, we know the user is editing, and so the number of days and suspended until dates have been updated already
    return this.renderView(req, res, {
      prisonerName,
      outcome,
      daysToActivate: outcome ? daysToActivate : undefined,
      suspendedUntil: outcome ? apiDateToDatePicker(suspendedUntil) : undefined,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, id } = req.params
    const { outcome, daysToActivate, suspendedUntil } = req.body
    const { user } = res.locals

    const { prisonerName } = await this.punishmentsService.getRehabilitativeActivitiesCompletionDetails(
      req,
      chargeNumber,
      +id,
      user
    )

    const error = validateForm({ outcome, daysToActivate, suspendedUntil, prisonerName })

    if (error) {
      return this.renderView(req, res, {
        error,
        prisonerName,
        outcome,
        daysToActivate,
        suspendedUntil,
      })
    }

    try {
      this.punishmentsService.addCompletedRehabilitativeActivity(
        req,
        false,
        outcome,
        daysToActivate,
        suspendedUntil ? datePickerToApi(suspendedUntil) : null
      )
      return res.redirect(adjudicationUrls.checkYourAnswersCompleteRehabilitativeActivity.urls.start(chargeNumber, +id))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
      throw postError
    }
  }
}
