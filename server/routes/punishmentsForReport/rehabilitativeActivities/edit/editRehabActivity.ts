/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { datePickerToApi, formatDateForDatePicker, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import PunishmentsService from '../../../../services/punishmentsService'
import validateForm from '../activityDetails/activityDetailsValidation'

type PageData = {
  error?: FormError
  activityDescription?: string
  monitorName?: string
  endDate?: string
  numberOfSessions?: number
}

export default class editRehabilitativeActivityPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, activityDescription, monitorName, endDate, numberOfSessions } = pageData

    return res.render(`pages/rehabilitativeActivityDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      today: formatDateForDatePicker(new Date().toISOString(), 'short'),
      activityDescription,
      monitorName,
      endDate,
      numberOfSessions,
      isEdit: true,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    const { chargeNumber, redisId, id } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const rehabActivity = await this.punishmentsService.getRehabActivity(req, chargeNumber, redisId, +id)
    const { details, monitor, totalSessions, endDate } = rehabActivity

    return this.renderView(req, res, {
      activityDescription: details,
      monitorName: monitor,
      endDate,
      numberOfSessions: totalSessions,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId, id } = req.params
    const { user } = res.locals
    const { activityDescription, monitorName, endDate, numberOfSessions } = req.body

    const error = validateForm({ activityDescription, monitorName, endDate, numberOfSessions })
    if (error)
      return this.renderView(req, res, {
        error,
        activityDescription,
        monitorName,
        endDate,
        numberOfSessions,
      })

    const updatedRehabActivity = {
      activityDescription,
      monitor: monitorName,
      endDate: datePickerToApi(endDate),
      numberOfSessions,
      sessionId: +id,
    }

    await this.punishmentsService.editRehabilitativeActivity(req, chargeNumber, redisId, +id, updatedRehabActivity)
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
