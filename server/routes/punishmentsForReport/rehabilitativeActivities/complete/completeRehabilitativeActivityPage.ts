/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'
import { FormError } from '../../../../@types/template'
import { RehabilitativeActivity } from '../../../../data/PunishmentResult'
import validateForm from './validation'

type PageData = {
  error?: FormError
  completed?: string
  activities: RehabilitativeActivity[]
  prisonerName: string
}

export default class CompleteRehabilitativeActivityPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { prisonerName, activities, completed, error } = pageData

    let completedText = ''

    if (completed) {
      completedText = completed ? 'YES' : 'NO'
    }

    return res.render(`pages/completeRehabilitativeActivity.njk`, {
      cancelHref: adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber),
      prisonerName,
      activities,
      completed: completedText,
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, id } = req.params
    const { user } = res.locals

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const { completed, activities, prisonerName } =
      await this.punishmentsService.getRehabilitativeActivitiesCompletionDetails(req, chargeNumber, +id, user)

    return this.renderView(req, res, {
      prisonerName,
      activities,
      completed,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, id } = req.params
    const { completed } = req.body
    const { user } = res.locals

    const { prisonerName, activities } = await this.punishmentsService.getRehabilitativeActivitiesCompletionDetails(
      req,
      chargeNumber,
      +id,
      user
    )
    const error = validateForm({ completed, prisonerName })

    if (error) {
      return this.renderView(req, res, {
        error,
        completed,
        prisonerName,
        activities,
      })
    }

    if (completed === 'YES') {
      try {
        this.punishmentsService.addCompletedRehabilitativeActivity(req, true)
        return res.redirect(
          adjudicationUrls.checkYourAnswersCompleteRehabilitativeActivity.urls.start(chargeNumber, +id)
        )
      } catch (postError) {
        res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(chargeNumber)
        throw postError
      }
    }

    return res.redirect(adjudicationUrls.incompleteRehabilitativeActivity.urls.start(chargeNumber, +id))
  }
}
