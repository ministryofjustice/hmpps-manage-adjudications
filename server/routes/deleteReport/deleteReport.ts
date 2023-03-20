import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default class ContinueReportSelectRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { user } = res.locals

    const idValue: number = parseInt(id as string, 10)
    if (Number.isNaN(idValue)) {
      throw new Error('No draft adjudication id provided')
    }

    await this.placeOnReportService.removeDraftAdjudication(idValue, user)

    return res.redirect(adjudicationUrls.continueReport.root)
  }
}
