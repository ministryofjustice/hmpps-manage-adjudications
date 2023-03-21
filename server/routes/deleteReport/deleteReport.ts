import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default class DeleteReportRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (
    req: Request,
    res: Response,
    reportId: string,
    cancelLinkURL: string,
    reportDeleteLinkURL: string
  ): Promise<void> => {
    return res.render(`pages/deleteReport`, {
      reportId,
      cancelLinkURL,
      reportDeleteLinkURL,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const idValue: number = parseInt(id as string, 10)
    if (Number.isNaN(idValue)) {
      throw new Error('No draft adjudication id provided')
    }
    const cancelLinkURL = adjudicationUrls.continueReport.urls.start()
    const reportDeleteLinkURL = adjudicationUrls.deleteReport.urls.delete(idValue)

    return this.renderView(req, res, id, cancelLinkURL, reportDeleteLinkURL)
  }

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
