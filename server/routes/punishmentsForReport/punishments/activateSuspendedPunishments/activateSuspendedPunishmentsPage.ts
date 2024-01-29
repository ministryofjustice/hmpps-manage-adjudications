import url from 'url'
import { Request, Response } from 'express'
import { FormError } from '../../../../@types/template'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import { hasAnyRole } from '../../../../utils/utils'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentDataWithSchedule } from '../../../../data/PunishmentResult'

export default class ActivateSuspendedPunishmentsPage {
  constructor(private readonly punishmentsService: PunishmentsService, private readonly userService: UserService) {}

  private renderView = async (req: Request, res: Response, error: FormError | null): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const suspendedPunishmentDetails = await this.punishmentsService.getSuspendedPunishmentDetails(chargeNumber, user)
    // Should only show suspended punishments that have not been added in this reports
    const suspendedPunishmentsFromOtherReports = suspendedPunishmentDetails.suspendedPunishments.filter(
      susPun => susPun.chargeNumber !== chargeNumber
    )

    const sessionPunishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)

    let suspendedPunishmentsToActivate = suspendedPunishmentsFromOtherReports
    if (sessionPunishments != null) {
      const idsToFilter = (<PunishmentDataWithSchedule[]>sessionPunishments).map(punishment => punishment.id)
      suspendedPunishmentsToActivate = suspendedPunishmentsFromOtherReports.filter(
        suspendedPunishments => !idsToFilter.includes(suspendedPunishments.punishment.id)
      )
    }

    return res.render(`pages/activateSuspendedPunishments.njk`, {
      awardPunishmentsHref: adjudicationUrls.awardPunishments.urls.modified(chargeNumber),
      prisonerName: suspendedPunishmentDetails.prisonerName,
      suspendedPunishments: suspendedPunishmentsToActivate,
      errors: error ? [error] : [],
      status: suspendedPunishmentDetails.status,
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
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { activate } = req.body
    const punishmentNumberToActivate = activate.split('-').slice(-1)[0] || null

    const punishmentToActivate = await this.punishmentsService.getSuspendedPunishment(
      chargeNumber,
      Number(punishmentNumberToActivate),
      user
    )
    const punishmentType = punishmentToActivate[0].punishment.type
    const { days } = punishmentToActivate[0].punishment.schedule

    const redirectUrl = this.getRedirectUrl(chargeNumber)
    return res.redirect(
      url.format({
        pathname: redirectUrl,
        query: { punishmentNumberToActivate, punishmentType, days },
      })
    )
  }

  getRedirectUrl = (chargeNumber: string) => {
    return adjudicationUrls.suspendedPunishmentNumberOfDays.urls.existing(chargeNumber)
  }
}
