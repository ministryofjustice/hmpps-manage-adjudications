/* eslint-disable max-classes-per-file */
// import url from 'url'
import { Request, Response } from 'express'
// import { ParsedUrlQuery } from 'querystring'
import UserService from '../../../../services/userService'
import { formatDateForDatePicker, hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { FormError } from '../../../../@types/template'
import PunishmentsService from '../../../../services/punishmentsService'

type PageData = {
  error?: FormError
  activityDescription?: string
  monitorName?: string
  endDate?: string
  numberOfSessions?: string
}

export default class rehabilitativeActivityDetailsPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { error, activityDescription, monitorName, endDate, numberOfSessions } = pageData
    const { numberOfActivities, currentActivityNumber } = req.query

    return res.render(`pages/rehabilitativeActivityDetails.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      errors: error ? [error] : [],
      numberOfActivities,
      currentActivityNumber,
      today: formatDateForDatePicker(new Date().toISOString(), 'short'),
      activityDescription,
      monitorName,
      endDate,
      numberOfSessions,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, {})
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submit = async (req: Request, res: Response): Promise<void> => {
    const { numberOfActivities, currentActivityNumber } = req.query
    const { chargeNumber, redisId } = req.params
    const { activityDescription, monitorName, endDate, numberOfSessions } = req.query
    // const error = validateForm({ hasDetails: hasRehabilitativeActivitiesDetails })
    // if (error)
    //   return this.renderView(req, res, {
    //     error,
    //   })
    // Add these details to the session

    const activityDetails = {
      details: String(activityDescription),
      monitor: String(monitorName),
      endDate: String(endDate),
      totalSessions: Number(numberOfSessions),
      id: Number(currentActivityNumber), // not sure about this, ask Tim what he thinks, maybe needs to be uuid?
    }
    this.punishmentsService.addRehabilitativeActivity(
      req,
      chargeNumber,
      redisId,
      Number(currentActivityNumber),
      activityDetails
    )

    // check the current activity number against total activity number, if there are more to add, reload the page with new current activity number
    // currentActivityNumber = Number(currentActivityNumber)
    // numberOfActivities = Number(numberOfActivities)
    if (currentActivityNumber === numberOfActivities) {
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    return res.redirect('')
    // currentActivityNumber += 1
    // return res.redirect(
    //   url.format({
    //     pathname: adjudicationUrls.rehabilitativeActivityDetails.urls.start(chargeNumber, redisId),
    //     // eslint-disable-next-line no-plusplus
    //     query: { numberOfActivities, currentActivityNumber } as ParsedUrlQuery,
    //   })
    // )
  }
}
