import { Request, Response } from 'express'
import moment from 'moment'
import { datePickerToApi, hasAnyRole, momentDateToDatePicker } from '../../../utils/utils'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { FormError } from '../../../@types/template'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import { ScheduledHearingEnhanced } from '../../../data/ReportedAdjudicationResult'

export default class viewScheduledHearingsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    uiChosenDate: string,
    results: ScheduledHearingEnhanced[],
    errors: FormError[]
  ): Promise<void> => {
    return res.render(`pages/viewScheduledHearings`, {
      hearings: results,
      uiChosenDate,
      clearUrl: adjudicationUrls.viewScheduledHearings.urls.start(),
      viewScheduledHearingsHref: adjudicationUrls.viewScheduledHearings.urls.start(),
      viewAllCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      activeTab: 'viewScheduledHearings',
      errors,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    return this.validateRoles(req, res, async () => {
      const uiHearingDate = getUiDateFromRequest(req)
      const formattedUiHearingDate = datePickerToApi(uiHearingDate)
      const results = await this.reportedAdjudicationsService.getAllHearings(formattedUiHearingDate, user)
      return this.renderView(req, res, uiHearingDate, results, [])
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    return this.validateRoles(req, res, async () => {
      const { hearingDate } = req.body
      return res.redirect(adjudicationUrls.viewScheduledHearings.urls.filter(hearingDate))
    })
  }

  private validateRoles = async (req: Request, res: Response, thenCall: () => Promise<void>) => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return thenCall()
  }
}

const getUiDateFromRequest = (req: Request): string => {
  // Fill in today as a default if no hearing date on query
  return (req.query.hearingDate as string) || momentDateToDatePicker(moment())
}
