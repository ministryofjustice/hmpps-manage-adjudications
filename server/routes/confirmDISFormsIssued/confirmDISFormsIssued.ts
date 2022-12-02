import { Request, Response } from 'express'
// import mojPaginationFromPageResponse, { pageRequestFrom } from '../../utils/mojPagination/pagination'
// import { ReportedAdjudicationEnhanced } from '../../data/ReportedAdjudicationResult'
// import { ApiPageResponse } from '../../data/ApiData'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
// import adjudicationUrls from '../../utils/urlGenerator'
import { FormError } from '../../@types/template'

export default class AllCompletedReportsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    // results: ApiPageResponse<ReportedAdjudicationEnhanced>,
    errors: FormError[]
  ): Promise<void> =>
    res.render(`pages/confirmDISFormsIssued`, {
      //   reports: results,
      //   filter,
      //   pagination: mojPaginationFromPageResponse(
      //     results,
      //     new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
      //   ),
      errors,
    })

  view = async (req: Request, res: Response): Promise<void> => {
    //   const uiFilter = fillInDefaults(uiFilterFromRequest(req))
    //   const filter = filterFromUiFilter(uiFilter)
    //   const results = await this.reportedAdjudicationsService.getAllCompletedAdjudications(
    //     res.locals.user,
    //     filter,
    //     pageRequestFrom(20, +req.query.pageNumber || 1)
    //   )
    return this.renderView(req, res, [])
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submit = async (req: Request, res: Response): Promise<void> => {
    //   const uiFilter = uiFilterFromBody(req)
    //   const errors = validate(uiFilter)
    //   if (errors && errors.length !== 0) {
    //     return this.renderView(req, res, uiFilter, { size: 20, number: 0, totalElements: 0, content: [] }, errors)
    //   }
    //   return res.redirect(adjudicationUrls.allCompletedReports.urls.filter(uiFilter))
  }
}
