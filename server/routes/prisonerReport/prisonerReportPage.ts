/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import UserService from '../../services/userService'
import {
  allCompletedReports,
  incidentDetails,
  incidentStatementUrls,
  printReport,
  prisonerReport,
  yourCompletedReports,
} from '../../utils/urlGenerator'

export enum PageRequestType {
  REPORTER,
  REVIEWER,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isReviewerView(): boolean {
    return this.pageType === PageRequestType.REVIEWER
  }
}

const getVariablesForPageType = (
  pageOptions: PageOptions,
  prisonerNumber: string,
  adjudicationNumber: number,
  draftAdjudicationNumber: number
) => {
  if (pageOptions.isReviewerView()) {
    return {
      // We don't need a editIncidentStatementURL here as a reviewer can't edit the statement
      printHref: `${printReport.urls.start(adjudicationNumber)}?referrer=${prisonerReport.urls.review}`,
      editIncidentDetailsURL: `${incidentDetails.urls.submittedEdit(
        prisonerNumber,
        draftAdjudicationNumber
      )}?referrer=${prisonerReport.urls.review}`,
      returnLinkURL: allCompletedReports.root,
      returnLinkContent: 'Return to all completed reports',
    }
  }
  return {
    editIncidentStatementURL: incidentStatementUrls.urls.submittedEdit(draftAdjudicationNumber),
    printHref: `${printReport.urls.start(adjudicationNumber)}?referrer=${prisonerReport.urls.report}`,
    editIncidentDetailsURL: `${incidentDetails.urls.submittedEdit(prisonerNumber, draftAdjudicationNumber)}?referrer=${
      prisonerReport.urls.report
    }`,
    returnLinkURL: yourCompletedReports.root,
    returnLinkContent: 'Return to your completed reports',
  }
}

export default class prisonerReportRoutes {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly decisionTreeService: DecisionTreeService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals

    const newDraftAdjudicationId = await this.reportedAdjudicationsService.createDraftFromCompleteAdjudication(
      user,
      Number(req.params.adjudicationNumber)
    )

    const { draftAdjudication, prisoner, associatedPrisoner } =
      await this.decisionTreeService.draftAdjudicationIncidentData(newDraftAdjudicationId, user)

    const incidentLocations = await this.locationService.getIncidentLocations(
      prisoner.assignedLivingUnit.agencyId,
      user
    )

    const prisonerReportData = await this.reportedAdjudicationsService.getPrisonerReport(
      user,
      incidentLocations,
      draftAdjudication
    )

    const offences = await this.decisionTreeService.getAdjudicationOffences(
      draftAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      draftAdjudication.incidentRole,
      user
    )

    const prisonerReportVariables = getVariablesForPageType(
      this.pageOptions,
      prisoner.prisonerNumber,
      draftAdjudication.adjudicationNumber,
      newDraftAdjudicationId
    )

    return res.render(`pages/prisonerReport`, {
      prisoner,
      prisonerReportData,
      reportNo: draftAdjudication.adjudicationNumber,
      offences,
      statementEditable: !this.pageOptions.isReviewerView(),
      ...prisonerReportVariables,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
