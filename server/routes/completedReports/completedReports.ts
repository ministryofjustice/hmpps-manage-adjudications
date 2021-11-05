import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default class CompletedReportsRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => res.render(`pages/completedReports`)

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
