import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import DamagesSessionService from '../../services/damagesSessionService'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './addDamagesValidation'

type PageData = {
  error?: FormError
  damageType?: string
  damageDescription?: string
}

export default class AddDamagesRoutes {
  constructor(private readonly damagesSessionService: DamagesSessionService) {}

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error, damageType, damageDescription } = pageData
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const submitted = req.query.submitted as string

    // eslint-disable-next-line no-extra-boolean-cast
    const cancelButtonHref =
      submitted === 'true'
        ? adjudicationUrls.detailsOfDamages.urls.submittedEditModified(adjudicationNumber)
        : adjudicationUrls.detailsOfDamages.urls.modified(adjudicationNumber)

    return res.render(`pages/addDamages`, {
      errors: error ? [error] : [],
      damageDescription,
      damageType,
      cancelButtonHref,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const submitted = req.query.submitted as string
    const { damageType, damageDescription } = req.body

    const error = validateForm({ damageType, damageDescription })
    if (error)
      return this.renderView(req, res, {
        error,
        damageType,
        damageDescription,
      })

    const damageToAdd = {
      code: damageType,
      details: damageDescription,
      reporter: user.username,
    }

    this.damagesSessionService.addSessionDamage(req, damageToAdd, adjudicationNumber)
    const redirectUrl = this.getRedirectUrl(submitted === 'true', adjudicationNumber)
    return res.redirect(redirectUrl)
  }

  getRedirectUrl = (submitted: boolean, adjudicationNumber: number) => {
    if (submitted) return adjudicationUrls.detailsOfDamages.urls.submittedEditModified(adjudicationNumber)
    return adjudicationUrls.detailsOfDamages.urls.modified(adjudicationNumber)
  }
}
