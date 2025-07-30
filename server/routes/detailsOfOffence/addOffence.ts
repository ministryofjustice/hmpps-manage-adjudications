import url from 'url'
import { Request, Response } from 'express'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import adjudicationUrls from '../../utils/urlGenerator'

export default class AddOffenceRoutes {
  add = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const offenceToAdd: OffenceData = { ...req.query }
    return this.redirect(
      {
        pathname: adjudicationUrls.detailsOfOffence.urls.modified(draftId),
        query: offenceToAdd,
      },
      res,
    )
  }

  aloAdd = async (req: Request, res: Response): Promise<void> => {
    const draftId = Number(req.params.draftId)
    const offenceToAdd: OffenceData = { ...req.query }
    return this.redirect(
      {
        pathname: adjudicationUrls.detailsOfOffence.urls.aloEdit(draftId),
        query: offenceToAdd,
      },
      res,
    )
  }

  private redirect(urlQuery: { pathname: string; query?: { [key: string]: string | string[] } }, res: Response) {
    return res.redirect(url.format(urlQuery))
  }
}
