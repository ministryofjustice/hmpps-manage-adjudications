import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import PunishmentsService from '../../../services/punishmentsService'

export default class ActivateSuspendedPunishmentsPage {
  constructor(private readonly punishmentsService: PunishmentsService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, error: FormError | null): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const suspendedPunishmentDetails = await this.punishmentsService.getSuspendedPunishmentDetails(
      adjudicationNumber,
      user
    )

    return res.render(`pages/activateSuspendedPunishments.njk`, {
      awardPunishmentsHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      manuallyActivateSuspendedPunishmentsHref:
        adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(adjudicationNumber),
      prisonerName: suspendedPunishmentDetails.prisonerName,
      suspendedPunishments: suspendedPunishmentDetails.suspendedPunishments,
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    return this.renderView(req, res, null)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    // TODO work out if we can use existing schedule page
    return res.redirect(adjudicationUrls.punishmentSchedule.urls.start(adjudicationNumber))
  }
}
