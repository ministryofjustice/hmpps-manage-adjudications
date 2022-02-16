import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class DetailsOfOffenceRoutes {
  // constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber, id } = req.params
    return res.render(`pages/detailsOfOffence`, {
      prisonerNumber,
      id,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res)
  }
}
