/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import { hasAnyRole } from '../../../../utils/utils'
import adjudicationUrls from '../../../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default class RemoveRehabilitativeActivityPage {
  constructor(
    private readonly userService: UserService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService
  ) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params

    return res.render(`pages/removeRehabilitativeActivity.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
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
    const { chargeNumber, id } = req.params
    const { user } = res.locals

    await this.reportedAdjudicationsService.removeRehabilitativeActivity(chargeNumber, Number(id), user)
    return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
  }
}
