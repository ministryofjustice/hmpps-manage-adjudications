import { Request, Response } from 'express'
import moment from 'moment'
import { datePickerDateToMoment, hasAnyRole, momentDateToDatePicker } from '../../utils/utils'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import { FormError } from '../../@types/template'
import LocationService from '../../services/locationService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { ScheduledHearing } from '../../data/ReportedAdjudicationResult'

export default class viewScheduledHearingsRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService
  ) {}

  private renderView = async (
    req: Request,
    res: Response,
    uiChosenDate: string,
    results: ScheduledHearing[],
    errors: FormError[]
  ): Promise<void> => {
    return res.render(`pages/viewScheduledHearings`, {
      hearings: results,
      uiChosenDate,
      errors,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    return this.validateRoles(req, res, async () => {
      const uiChosenDate = getUiDate(req)
      const filter = getApiDate(uiChosenDate)
      const results = await this.reportedAdjudicationsService.getAllHearings(filter, user)
      // need to add friendlyName to each hearing
      return this.renderView(req, res, uiChosenDate, results.hearings, [])
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    // return this.validateRoles(req, res, async () => {
    //   const uiFilter = uiFilterFromBody(req)
    //   const errors = validate(uiFilter)
    //   if (errors && errors.length !== 0) {
    //     return this.renderView(req, res, uiFilter, results, errors)
    //   }
    //   return res.redirect(adjudicationUrls.allCompletedReports.urls.filter(uiFilter))
    // })
  }

  private validateRoles = async (req: Request, res: Response, thenCall: () => Promise<void>) => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
    }
    return thenCall()
  }
}

const getUiDate = (req: Request): string => {
  return req.body.hearingDate || momentDateToDatePicker(moment())
}

const getApiDate = (chosenDate: string) => {
  return datePickerDateToMoment(chosenDate)
}
