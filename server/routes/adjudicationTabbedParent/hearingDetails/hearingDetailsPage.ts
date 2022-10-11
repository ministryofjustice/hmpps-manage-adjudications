/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import {
  ReportedAdjudicationStatus,
  reportedAdjudicationStatusDisplayName,
} from '../../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'

export enum PageRequestType {
  CREATION,
  EDIT,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isEdit(): boolean {
    return this.pageType === PageRequestType.EDIT
  }
}

export default class HearingDetailsPage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const reportedAdjudicationResult = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      adjudicationNumber,
      user
    )
    const { reportedAdjudication } = reportedAdjudicationResult
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(
      reportedAdjudication.prisonerNumber,
      user
    )

    // const hearings = reportedAdjudication.hearings // something like this - will probably need to manipulate
    const hearings = []

    return res.render(`pages/adjudicationTabbedParent/hearingDetails`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudicationStatusDisplayName(reportedAdjudication.status),
      schedulingAvailable: reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED,
      hearings: [],
      scheduleHearingButtonHref: '', // TODO set up adjudicationUrl for this
      scheduleHearingButtonText: getScheduleHearingButtonText(hearings.length),
      allCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      reportHref: adjudicationUrls.adjudicationReport.urls.report(reportedAdjudication.adjudicationNumber), // TODO we need to figure out which version (reporter/reviewer) needs to be used here
      hearingsHref: adjudicationUrls.hearingDetails.urls.start(reportedAdjudication.adjudicationNumber),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {}
}

const getScheduleHearingButtonText = (hearingNumber: number) => {
  if (hearingNumber) return 'Schedule another hearing for this report'
  return 'Schedule a hearing'
}
