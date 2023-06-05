/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../@types/template'

type PageData = {
  error?: FormError
}

class PageOptions {}

export default class DataInsightsPage {
  pageOptions: PageOptions

  constructor() {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (res: Response, idValue: number, pageData: PageData): Promise<void> => {
    const { error } = pageData

    return res.render(`pages/dataInsights.njk`, {
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    return this.renderView(res, adjudicationNumber, {})
  }
}
