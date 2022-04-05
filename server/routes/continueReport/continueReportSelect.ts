import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class ContinueReportSelectRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals

    const reports = await this.placeOnReportService.getAllDraftAdjudicationsForUser(user)

    return res.render(`pages/continueReportSelect`, {
      reports,
    })
  }
}
