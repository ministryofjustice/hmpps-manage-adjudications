import { Request, Response } from 'express'
import { pageRequestFrom, PageResponse } from '../../utils/pageResponse'
import mojPaginationFromPageResponse from '../../utils/pagination'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default class YourCompletedReportsRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (
    req: Request,
    res: Response,
    results: PageResponse<ReportedAdjudication>
  ): Promise<void> =>
    res.render(`pages/yourCompletedReports`, {
      yourCompletedReports: results,
      pagination: mojPaginationFromPageResponse(
        results,
        new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      ),
    })

  view = async (req: Request, res: Response): Promise<void> => {
    const results = await this.reportedAdjudicationsService.getYourCompletedAdjudications(
      res.locals.user,
      pageRequestFrom(20, +req.query.pageNumber || 1)
    )
    return this.renderView(req, res, results)
  }
}
