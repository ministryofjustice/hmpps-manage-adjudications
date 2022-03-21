import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'

export default class prisonerReportRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals

    const newDraftAdjudicationId = await this.reportedAdjudicationsService.createDraftFromCompleteAdjudication(
      user,
      Number(req.params.adjudicationNumber)
    )

    const { draftAdjudication, incidentRole, prisoner, associatedPrisoner } =
      await this.decisionTreeService.adjudicationData(newDraftAdjudicationId, user)

    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )
    const prisonerReportData = await this.reportedAdjudicationsService.getPrisonerReport(
      user,
      incidentLocations,
      draftAdjudication
    )

    const allOffenceData = await this.decisionTreeService.allOffences(newDraftAdjudicationId, user)
    const offences = await this.decisionTreeService.getAdjudicationOffences(
      allOffenceData,
      prisoner,
      associatedPrisoner,
      incidentRole,
      draftAdjudication,
      user
    )

    return res.render(`pages/prisonerReport`, {
      prisoner,
      prisonerReportData,
      reportNo: draftAdjudication.adjudicationNumber,
      offences,
      printHref: `/print-report/${req.params.adjudicationNumber}?referrer=/prisoner-report/${prisoner.prisonerNumber}/${req.params.adjudicationNumber}/report`,
      editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${draftAdjudication.id}/submitted/edit?referrer=/prisoner-report/${prisoner.prisonerNumber}/${req.params.adjudicationNumber}/report`,
      editIncidentStatementURL: `/incident-statement/${prisoner.prisonerNumber}/${draftAdjudication.id}/submitted/edit`,
      statementEditable: true,
      returnLinkURL: `/your-completed-reports`,
      returnLinkContent: 'Return to your completed reports',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
