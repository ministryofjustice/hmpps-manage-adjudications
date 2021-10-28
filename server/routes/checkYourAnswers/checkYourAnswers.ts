import { Request, Response } from 'express'
import { FormError } from '../../@types/template'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class IncidentStatementRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response, error: { [key: string]: FormError }): Promise<void> => {
    return res.render(`pages/checkYourAnswers`, {
      errors: error ? [error] : [],
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})
}
