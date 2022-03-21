import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'

import { hasAnyRole } from '../../utils/utils'

export default class prisonerReportReviewRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
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
      printHref: `/print-report/${draftAdjudication.adjudicationNumber}?referrer=/prisoner-report/${prisoner.prisonerNumber}/${draftAdjudication.adjudicationNumber}/review`,
      editIncidentDetailsURL: `/incident-details/${prisoner.prisonerNumber}/${newDraftAdjudicationId}/submitted/edit?referrer=/prisoner-report/${prisoner.prisonerNumber}/${draftAdjudication.adjudicationNumber}/review`,
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
