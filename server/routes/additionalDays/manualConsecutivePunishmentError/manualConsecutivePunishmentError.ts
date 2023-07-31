import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import { hasAnyRole } from '../../../utils/utils'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'

export default class ManualConsecutivePunishmentErrorPage {
  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { chargeId } = req.params
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)

    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const prisoner = await this.punishmentsService.getPrisonerDetails(chargeId, user)
    const { redirectUrl, chargeNumber } = req.query

    return res.render(`pages/manualConsecutivePunishmentError.njk`, {
      cancelHref: adjudicationUrls.awardPunishments.urls.modified(chargeId),
      chargeNumber,
      prisonerName: prisoner.friendlyName || 'this prisoner',
      buttonHref: redirectUrl,
    })
  }
}
