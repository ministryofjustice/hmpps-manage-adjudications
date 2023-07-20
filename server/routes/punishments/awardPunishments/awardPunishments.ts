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

    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const punishmentToDelete = req.query.delete || null

    const redirectAfterRemoveUrl = `${adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber)}?delete=`

    let punishments = await this.getPunishments(req, adjudicationNumber, user)

    let renderEmptyTable = false

    if (punishments.length === 0 && this.pageOptions.displaySessionData()) {
      const apiPunishments = this.getPunishmentsFromApi(req, adjudicationNumber, user)
      renderEmptyTable = !!apiPunishments && (await apiPunishments).length > 0
    }

    // // If we are not displaying session data then fill in the session data
    if (this.pageOptions.displayAPIData()) {
      // Set up session to allow for adding and deleting
      this.punishmentsService.setAllSessionPunishments(req, punishments, adjudicationNumber)
      // Now we need to show the session data instead in order to have the redisId attached
      punishments = await this.punishmentsService.getAllSessionPunishments(req, adjudicationNumber)
    }

    if (punishmentToDelete) {
      await this.punishmentsService.deleteSessionPunishments(req, punishmentToDelete as string, adjudicationNumber)
      return res.redirect(adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber))
    }

    const continueHref = await this.getContinueHref(adjudicationNumber, user)
    return res.render(`pages/awardPunishments.njk`, {
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
      redirectAfterRemoveUrl,
      adjudicationNumber,
      punishments,
      continueHref,
      renderEmptyTable,
    })
  }

  getPunishments = async (req: Request, adjudicationNumber: number, user: User) => {
    if (this.pageOptions.displaySessionData()) {
      return this.punishmentsService.getAllSessionPunishments(req, adjudicationNumber)
    }
    return this.getPunishmentsFromApi(req, adjudicationNumber, user)
  }

  getPunishmentsFromApi = async (req: Request, adjudicationNumber: number, user: User) => {
    const punishments = await this.punishmentsService.getPunishmentsFromServer(adjudicationNumber, user)
    return flattenPunishments(punishments)
  }

  getContinueHref = async (adjudicationNumber: number, user: User) => {
    const punishments = await this.punishmentsService.getPunishmentsFromServer(adjudicationNumber, user)
    if (punishments && punishments.length)
      return adjudicationUrls.checkPunishments.urls.submittedEdit(adjudicationNumber)
    return adjudicationUrls.checkPunishments.urls.start(adjudicationNumber)
  }
}
