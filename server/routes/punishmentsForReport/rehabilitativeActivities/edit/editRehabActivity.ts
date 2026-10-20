import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { apiDateToDatePicker, datePickerToApi, formatDateForDatePicker, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import PunishmentsService from '../../../../services/punishmentsService'
import validateForm, { validateCompletionDate } from '../activityDetails/activityDetailsValidation'

type PageData = {
  error?: FormError
  details?: string
  monitorName?: string
  endDate?: string
  totalSessions?: number
}

export default class editRehabilitativeActivityPage {
  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, details, monitorName, endDate, totalSessions } = pageData

    return res.render(`pages/rehabilitativeActivityDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      today: formatDateForDatePicker(new Date().toISOString(), 'short'),
      details,
      monitorName,
      endDate,
      totalSessions,
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
      details,
      monitorName: monitor,
      endDate: endDate ? apiDateToDatePicker(endDate) : null,
      totalSessions,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId, id } = req.params
    const { details, monitorName, endDate, totalSessions } = req.body

    const { friendlyName } = await this.punishmentsService.getPrisonerDetails(chargeNumber, res.locals.user)

    const error =
      validateForm({ prisonerName: friendlyName, details, monitorName, endDate, totalSessions }) ||
      (res.locals.featureToggles?.multiPrivilegePunishments &&
        validateCompletionDate({
          endDate,
          latestDate: this.punishmentsService.getSessionPunishment(req, chargeNumber, redisId)?.suspendedUntil,
          coversSeveralPunishments: false,
        }))
    if (error)
      return this.renderView(req, res, {
        error,
        details,
        monitorName,
        endDate,
        totalSessions,
      })

    const updatedRehabActivity = {
      details,
      monitor: monitorName,
      endDate: datePickerToApi(endDate),
      totalSessions,
      sessionId: +id,
    }

    await this.punishmentsService.editRehabilitativeActivity(req, chargeNumber, redisId, +id, updatedRehabActivity)
    // a change made from the rehabilitative schedule read-back returns there
    if (
      res.locals.featureToggles?.multiPrivilegePunishments &&
      this.punishmentsService.isInRehabBatch(req, chargeNumber, redisId)
    ) {
      return res.redirect(adjudicationUrls.rehabilitativeActivitiesSchedule.urls.start(chargeNumber))
    }
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
