/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { User } from '../../../data/hmppsAuthClient'
import { flattenPunishments } from '../../../data/PunishmentResult'
import PunishmentsService from '../../../services/punishmentsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { hasAnyRole } from '../../../utils/utils'
import UserService from '../../../services/userService'

export enum PageRequestType {
  PUNISHMENTS_FROM_API,
  PUNISHMENTS_FROM_SESSION,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  displayAPIData(): boolean {
    return this.pageType === PageRequestType.PUNISHMENTS_FROM_API
  }

  displaySessionData(): boolean {
    return this.pageType === PageRequestType.PUNISHMENTS_FROM_SESSION
  }
}

export default class AwardPunishmentsPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const userRoles = await this.userService.getUserRoles(user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }

    const { chargeNumber } = req.params
    const punishmentToDelete = req.query.delete || null

    const redirectAfterRemoveUrl = `${adjudicationUrls.awardPunishments.urls.modified(chargeNumber)}?delete=`

    let punishments = await this.getPunishments(req, chargeNumber, user)

    // // If we are not displaying session data then fill in the session data
    if (this.pageOptions.displayAPIData()) {
      // Set up session to allow for adding and deleting
      this.punishmentsService.setAllSessionPunishments(req, punishments, chargeNumber)
      // Now we need to show the session data instead in order to have the redisId attached
      punishments = await this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    }

    if (punishmentToDelete) {
      await this.punishmentsService.deleteSessionPunishments(req, punishmentToDelete as string, chargeNumber)
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(chargeNumber))
    }
    const continueHref = await this.getContinueHref(chargeNumber, user)
    return res.render(`pages/awardPunishments.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(chargeNumber),
      redirectAfterRemoveUrl,
      chargeNumber,
      punishments,
      continueHref,
    })
  }

  getPunishments = async (req: Request, chargeNumber: string, user: User) => {
    if (this.pageOptions.displaySessionData()) {
      return this.punishmentsService.getAllSessionPunishments(req, chargeNumber)
    }
    const punishments = await this.punishmentsService.getPunishmentsFromServer(chargeNumber, user)
    return flattenPunishments(punishments)
  }

  getContinueHref = async (chargeNumber: string, user: User) => {
    const punishments = await this.punishmentsService.getPunishmentsFromServer(chargeNumber, user)
    if (punishments && punishments.length) return adjudicationUrls.checkPunishments.urls.submittedEdit(chargeNumber)
    return adjudicationUrls.checkPunishments.urls.start(chargeNumber)
  }
}
