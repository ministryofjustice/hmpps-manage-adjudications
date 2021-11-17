import { Request, Response } from 'express'
import CompletedAdjudicationsService from '../../services/completedAdjudicationsService'
import { pageRequestFrom, PageResponse } from '../../utils/pageResponse'
import mojPaginationFromPageResponse from '../../utils/pagination'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'

export default class YourCompletedReportsRoutes {
  constructor(private readonly completedAdjudicationsService: CompletedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    results: PageResponse<ReportedAdjudication>
  ): Promise<void> =>
    res.render(`pages/yourCompletedReports`, {
      yourCompletedReports: results,
      pagination: mojPaginationFromPageResponse(
        results.changeIndex(1),
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    const results = await this.completedAdjudicationsService.getCompletedAdjudications(
      res.locals.user,
      pageRequestFrom(20, +req.query.pageNumber || 1)
    )
    return this.renderView(req, res, results)
  }
}
