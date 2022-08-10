import { Request, Response } from 'express'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'

export default class AddDamagesRoutes {
  constructor(private readonly damagesSessionService: DamagesSessionService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    // This is the draftId
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return res.render(`pages/addDamages`, {
      cancelButtonHref: adjudicationUrls.detailsOfDamages.urls.modified(adjudicationNumber),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { damageType, damageDescription } = req.body

    const damageToAdd = {
      type: damageType,
      description: damageDescription,
    }

    this.damagesSessionService.addSessionDamage(req, damageToAdd, adjudicationNumber)
    return res.redirect(adjudicationUrls.detailsOfDamages.urls.modified(adjudicationNumber))
  }
}
