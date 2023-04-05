/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { convertPunishmentSessionToApi } from '../../../data/PunishmentResult'
import PunishmentsService from '../../../services/punishmentsService'
import adjudicationUrls from '../../../utils/urlGenerator'

export default class CheckPunishmentsPage {
  constructor(private readonly punishmentsService: PunishmentsService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    const punishments = convertPunishmentSessionToApi(
      await this.punishmentsService.getAllSessionPunishments(req, adjudicationNumber)
    )

    return res.render(`pages/checkPunishments.njk`, {
      adjudicationNumber,
      punishments,
      changePunishmentLink: adjudicationUrls.awardPunishments.urls.modified(adjudicationNumber),
      cancelHref: adjudicationUrls.hearingDetails.urls.review(adjudicationNumber),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)

    const punishments = await this.punishmentsService.getAllSessionPunishments(req, adjudicationNumber)

    try {
      await this.punishmentsService.createPunishmentSet(punishments, adjudicationNumber, user)
      return res.redirect(adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber))
    } catch (postError) {
      res.locals.redirectUrl = adjudicationUrls.punishmentsAndDamages.urls.review(adjudicationNumber)
      throw postError
    }
  }
}
