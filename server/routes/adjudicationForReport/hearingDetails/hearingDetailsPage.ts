/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import {
  ReportedAdjudication,
  ReportedAdjudicationStatus,
  reportedAdjudicationStatusDisplayName,
} from '../../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'

export enum PageRequestType {
  REPORTER,
  REVIEWER,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isReporter(): boolean {
    return this.pageType === PageRequestType.REPORTER
  }
}

const getScheduleHearingButtonText = (hearingNumber: number) => {
  if (hearingNumber) return 'Schedule another hearing for this report'
  return 'Schedule a hearing'
}

const getVariablesForPageType = (pageOptions: PageOptions, reportedAdjudication: ReportedAdjudication) => {
  if (pageOptions.isReporter()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.report(reportedAdjudication.adjudicationNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.report(reportedAdjudication.adjudicationNumber),
    }
  }
  return {
    reportHref: adjudicationUrls.prisonerReport.urls.review(reportedAdjudication.adjudicationNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.review(reportedAdjudication.adjudicationNumber),
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

    const hearingSummary = await this.reportedAdjudicationsService.getHearingDetails(
      reportedAdjudication.hearings,
      user
    )

    const schedulingAvailable =
      reportedAdjudication.status === ReportedAdjudicationStatus.UNSCHEDULED ||
      reportedAdjudication.status === ReportedAdjudicationStatus.SCHEDULED

    return res.render(`pages/adjudicationForReport/hearingDetails`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudicationStatusDisplayName(reportedAdjudication.status),
      schedulingAvailable,
      isAccepted: reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED,
      readOnly: this.pageOptions.isReporter(),
      hearings: hearingSummary,
      scheduleHearingButtonHref: adjudicationUrls.scheduleHearing.urls.start(adjudicationNumber),
      scheduleHearingButtonText: getScheduleHearingButtonText(reportedAdjudication.hearings?.length),
      allCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      allHearingsHref: adjudicationUrls.viewScheduledHearings.urls.start(),
      yourCompletedReportsHref: adjudicationUrls.yourCompletedReports.urls.start(),
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    if (req.body.cancelHearingButton) {
      await this.reportedAdjudicationsService.deleteHearing(adjudicationNumber, user)
    }
    return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
  }
}
