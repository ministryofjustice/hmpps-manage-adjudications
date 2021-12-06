import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'

export default class prisonerReportRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly locationService: LocationService
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
      printHref: `/print-report/${data.draftId}`,
      editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${data.draftId}/edit`,
      editIncidentStatementURL: `/incident-statement/${prisoner.prisonerNumber}/${data.draftId}`,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
