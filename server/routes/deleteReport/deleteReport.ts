import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default class DeleteReportRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, cancelLinkURL: string): Promise<void> => {
    return res.render(`pages/deleteReport`, {
      cancelLinkURL,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const idValue: number = parseInt(id as string, 10)
    if (Number.isNaN(idValue)) {
      throw new Error('No draft adjudication id provided')
    }
    const cancelLinkURL = adjudicationUrls.continueReport.urls.start()

    return this.renderView(req, res, cancelLinkURL)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
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
