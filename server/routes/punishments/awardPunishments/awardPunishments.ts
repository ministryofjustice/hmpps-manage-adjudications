/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { User } from '../../../data/hmppsAuthClient'
import { convertPunishmentSessionToApi } from '../../../data/PunishmentResult'
import PunishmentsService from '../../../services/punishmentsService'
import adjudicationUrls from '../../../utils/urlGenerator'

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

  constructor(pageType: PageRequestType, private readonly punishmentsService: PunishmentsService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const punishmentToDelete = req.query.delete || null

    const redirectAfterRemoveUrl = `${adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber)}?delete=`

    let punishments = await this.getPunishments(req, adjudicationNumber, user)

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

    return res.render(`pages/awardPunishments.njk`, {
      // TODO: Need to calculate the correct cancel href here
      cancelHref: adjudicationUrls.homepage.root,
      redirectAfterRemoveUrl,
      adjudicationNumber,
      punishments,
    })
  }

  getPunishments = async (req: Request, adjudicationNumber: number, user: User) => {
    if (this.pageOptions.displaySessionData()) {
      const punishments = this.punishmentsService.getAllSessionPunishments(req, adjudicationNumber)
      return convertPunishmentSessionToApi(punishments)
    }
    return this.punishmentsService.getPunishmentsFromServer(adjudicationNumber, user)
  }
}
