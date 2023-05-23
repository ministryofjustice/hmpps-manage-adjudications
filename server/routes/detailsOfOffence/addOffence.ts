import { Request, Response } from 'express'
import url from 'url'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import adjudicationUrls from '../../utils/urlGenerator'

export default class AddOffenceRoutes {
  add = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const offenceToAdd: OffenceData = { ...req.query }
    return this.redirect(
      {
        pathname: adjudicationUrls.detailsOfOffence.urls.modified(adjudicationNumber),
        query: offenceToAdd,
      },
      res
    )
  }

  aloAdd = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const offenceToAdd: OffenceData = { ...req.query }
    return this.redirect(
      {
        pathname: adjudicationUrls.detailsOfOffence.urls.aloEdit(adjudicationNumber),
        query: offenceToAdd,
      },
      res
    )
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }
}
