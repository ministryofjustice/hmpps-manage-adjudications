import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import UserService from '../../services/userService'

import { hasAnyRole } from '../../utils/utils'

export default class prisonerReportReviewRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService,
    private readonly userService: UserService
  ) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber, adjudicationNumber } = req.params
    const { user } = res.locals

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)
    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )

    const adjudicationNumberValue: number = parseInt(adjudicationNumber as string, 10)
    const data = await this.reportedAdjudicationsService.getPrisonerReport(
      user,
      adjudicationNumberValue,
      incidentLocations
    )

    return res.render(`pages/prisonerReport`, {
      prisoner,
      data,
      printHref: `/print-report/${adjudicationNumber}?referrer=/prisoner-report/${prisoner.prisonerNumber}/${adjudicationNumber}/review`,
      editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${data.draftId}/submitted/edit?referrer=/prisoner-report/${prisoner.prisonerNumber}/${adjudicationNumber}/review`,
      statementEditable: false,
      returnLinkURL: `/all-completed-reports`,
      returnLinkContent: 'Return to all completed reports',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const userRoles = await this.userService.getUserRoles(res.locals.user.token)
    if (!hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return res.render('pages/notFound.njk', { url: req.headers.referer || `/place-a-prisoner-on-report` })
    }
    return this.renderView(req, res)
  }
}
