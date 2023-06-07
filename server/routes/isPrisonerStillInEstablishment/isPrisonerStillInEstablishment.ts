/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import adjudicationUrls from '../../utils/urlGenerator'

type PageData = {
  error?: FormError
}

export default class isPrisonerStillInEstablishment {
  private renderView = async (res: Response, idValue: number, pageData: PageData): Promise<void> => {
    const { error } = pageData

    return res.render(`pages/isPrisonerStillInEstablishment.njk`, {
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(res, null, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { stillInEstablishment } = req.body
    if (stillInEstablishment) res.redirect(adjudicationUrls.searchForPrisoner.root)
    res.redirect(`${adjudicationUrls.searchForPrisoner.root}?transfer=true`)
  }
}
