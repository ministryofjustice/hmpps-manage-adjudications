import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import adjudicationUrls from '../../utils/urlGenerator'
import validateForm from './isPrisonerStillInEstablishmentValidation'

type PageData = {
  error?: FormError
  stillInEstablishment?: string
}

export default class isPrisonerStillInEstablishment {
  private renderView = async (res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    return res.render(`pages/isPrisonerStillInEstablishment.njk`, {
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { stillInEstablishment } = req.body

    const error = validateForm({ stillInEstablishment })
    if (error) return this.renderView(res, { error, stillInEstablishment })

    if (stillInEstablishment === 'true') return res.redirect(adjudicationUrls.searchForPrisoner.root)
    return res.redirect(`${adjudicationUrls.searchForPrisoner.root}?transfer=true`)
  }
}
