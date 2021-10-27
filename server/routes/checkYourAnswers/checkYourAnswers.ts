import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class IncidentStatementRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, error: { error?: any }): Promise<void> => {
    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})
}
