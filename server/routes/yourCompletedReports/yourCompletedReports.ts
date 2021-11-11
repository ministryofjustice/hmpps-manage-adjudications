import { Request, Response } from 'express'
import CompletedAdjudicationsService from '../../services/completedAdjudicationsService'
import { mojPaginationFromPageResponse, pageRequestFrom, PageResponse } from '../../utils/PageResponse'
import { CompletedAdjudicationSummary } from '../../data/CompletedAdjudicationsData'

export default class YourCompletedReportsRoutes {
  constructor(private readonly completedAdjudicationsService: CompletedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    results: PageResponse<CompletedAdjudicationSummary>
  ): Promise<void> =>
    res.render(`pages/yourCompletedReports`, {
      yourCompletedReports: results,
      pagination: mojPaginationFromPageResponse(results),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    const results = await this.completedAdjudicationsService.getCompletedAdjudications(
      res.locals.user,
      pageRequestFrom(20, 0)
    )
    return this.renderView(req, res, results)
  }
}
