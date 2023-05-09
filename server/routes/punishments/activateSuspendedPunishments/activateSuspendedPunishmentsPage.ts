import url from 'url'
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
    // Should only show suspended punishments that have not been added in this reports
    const suspendedPunishmentsFromOtherReports = suspendedPunishmentDetails.suspendedPunishments.filter(
      susPun => susPun.reportNumber !== adjudicationNumber
    )

    return res.render(`pages/activateSuspendedPunishments.njk`, {
      awardPunishmentsHref: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      manuallyActivateSuspendedPunishmentsHref:
        adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(adjudicationNumber),
      prisonerName: suspendedPunishmentDetails.prisonerName,
      suspendedPunishments: suspendedPunishmentsFromOtherReports,
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
    const { user } = res.locals
    const { activate } = req.body
    const punishmentNumberToActivate = activate.split('-').slice(-1)[0] || null

    const punishmentToActivate = await this.punishmentsService.getSuspendedPunishment(
      adjudicationNumber,
      Number(punishmentNumberToActivate),
      user
    )
    const punishmentType = punishmentToActivate[0].punishment.type

    return res.redirect(
      url.format({
        pathname: adjudicationUrls.suspendedPunishmentSchedule.urls.start(adjudicationNumber),
        query: { punishmentNumberToActivate, punishmentType },
      })
    )
  }
}
