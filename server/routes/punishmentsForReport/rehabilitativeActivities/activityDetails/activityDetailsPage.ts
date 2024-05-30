/* eslint-disable max-classes-per-file */
import url from 'url'
import { Request, Response } from 'express'
import { ParsedUrlQuery } from 'querystring'
import UserService from '../../../../services/userService'
import { datePickerToApi, formatDateForDatePicker, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import PunishmentsService from '../../../../services/punishmentsService'
import validateForm from './activityDetailsValidation'

type PageData = {
  error?: FormError
  details?: string
  monitorName?: string
  endDate?: string
  totalSessions?: string
}

export default class rehabilitativeActivityDetailsPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, details, monitorName, endDate, totalSessions } = pageData
    const { numberOfActivities, currentActivityNumber } = req.query

    return res.render(`pages/rehabilitativeActivityDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      numberOfActivities,
      currentActivityNumber,
      today: formatDateForDatePicker(new Date().toISOString(), 'short'),
      details,
      monitorName,
      endDate,
      totalSessions,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { numberOfActivities, currentActivityNumber } = req.query
    const { chargeNumber, redisId } = req.params
    const { details, monitorName, endDate, totalSessions } = req.body

    const { friendlyName } = await this.punishmentsService.getPrisonerDetails(chargeNumber, res.locals.user)

    const error = validateForm({ prisonerName: friendlyName, details, monitorName, endDate, totalSessions })
    if (error)
      return this.renderView(req, res, {
        error,
        details,
        monitorName,
        endDate,
        totalSessions,
      })

    const activityDetails = {
      details,
      monitor: monitorName,
      endDate: endDate ? datePickerToApi(endDate) : null,
      totalSessions: totalSessions ? Number(totalSessions) : null,
      sessionId: +currentActivityNumber,
    }
    this.punishmentsService.addRehabilitativeActivity(
      req,
      chargeNumber,
      redisId,
      Number(currentActivityNumber),
      activityDetails
    )

    if (currentActivityNumber === numberOfActivities) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    return res.redirect(
      url.format({
        pathname: adjudicationUrls.rehabilitativeActivityDetails.urls.start(chargeNumber, redisId),
        query: { numberOfActivities, currentActivityNumber: String(+currentActivityNumber + 1) } as ParsedUrlQuery,
      })
    )
  }
}
