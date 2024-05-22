/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

type PageData = {
  activityDescription?: string
  monitorName?: string
  endDate?: string
  numberOfSessions?: number
}

export default class RemoveRehabilitativeActivityPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { chargeNumber } = req.params
    const { activityDescription, monitorName, endDate, numberOfSessions } = pageData

    return res.render(`pages/removeRehabilitativeActivity.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      activityDescription,
      monitorName,
      endDate,
      numberOfSessions,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    const { chargeNumber, redisId, id } = req.params

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const rehabActivity = await this.punishmentsService.getRehabActivity(req, chargeNumber, redisId, +id)

    return this.renderView(req, res, {
      activityDescription: rehabActivity.details,
      monitorName: rehabActivity.monitor,
      endDate: rehabActivity.endDate,
      numberOfSessions: rehabActivity.totalSessions,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber, redisId, id } = req.params

    await this.punishmentsService.removeRehabilitativeActivity(req, chargeNumber, redisId, +id)
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
