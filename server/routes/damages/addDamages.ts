import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './addDamagesValidation'

type PageData = {
  error?: FormError
  damageType?: string
  damageDescription?: string
  cancelButtonHref?: string
}

export default class AddDamagesRoutes {
  constructor(private readonly damagesSessionService: DamagesSessionService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, damageType, damageDescription } = pageData

    return res.render(`pages/addDamages`, {
      errors: error ? [error] : [],
      damageDescription,
      damageType,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    // This is the draftId
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return this.renderView(req, res, {
      cancelButtonHref: adjudicationUrls.detailsOfDamages.urls.modified(adjudicationNumber),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { damageType, damageDescription } = req.body

    const error = validateForm({ damageType, damageDescription })
    if (error) return this.renderView(req, res, { error, damageType, damageDescription })

    const damageToAdd = {
      type: damageType,
      description: damageDescription,
      reporter: user.username,
    }

    this.damagesSessionService.addSessionDamage(req, damageToAdd, adjudicationNumber)
    return res.redirect(adjudicationUrls.detailsOfDamages.urls.modified(adjudicationNumber))
  }
}
