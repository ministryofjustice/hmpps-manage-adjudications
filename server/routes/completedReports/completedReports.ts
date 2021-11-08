import { Request, Response } from 'express'
import CompletedAdjudicationsService from '../../services/completedAdjudicationsService'
import { pageRequestFrom, PageResponse } from '../../utils/Pagination'
import { CompletedAdjudicationSummary } from '../../data/CompletedAdjudicationsData'

export default class CompletedReportsRoutes {
  constructor(private readonly completedAdjudicationsService: CompletedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    results: PageResponse<CompletedAdjudicationSummary>
  ): Promise<void> => res.render(`pages/completedReports`, results)

  view = async (req: Request, res: Response): Promise<void> => {
    const results = await this.completedAdjudicationsService.getCompletedAdjudications(
      res.locals.user,
      pageRequestFrom(20, 0)
    )
    return this.renderView(req, res, results)
  }
}
