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

export default class HearingTabPage {
  pageOptions: PageOptions

  constructor(pageType: PageRequestType, private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      adjudicationNumber,
      user
    )
    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(
      reportedAdjudication.prisonerNumber,
      user
    )
    const hearingSummary = await this.reportedAdjudicationsService.getHearingDetails(
      reportedAdjudication.hearings,
      user
    )
    const schedulingNotAvailable =
      reportedAdjudication.status === ReportedAdjudicationStatus.AWAITING_REVIEW ||
      reportedAdjudication.status === ReportedAdjudicationStatus.REJECTED ||
      reportedAdjudication.status === ReportedAdjudicationStatus.RETURNED ||
      // Including ACCEPTED here so that we can deal with the edgecase early
      // Legacy ACCEPTED reports should not have hearings or outcomes
      reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED

    return res.render(`pages/adjudicationForReport/hearingTab`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudication.status,
      schedulingNotAvailable,
      isAccepted: reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED,
      readOnly: this.pageOptions.isReporter(),
      hearings: hearingSummary,
      //   scheduleHearingButtonHref: adjudicationUrls.scheduleHearing.urls.start(adjudicationNumber),
      //   scheduleHearingButtonText: getScheduleHearingButtonText(reportedAdjudication.hearings?.length),
      allCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      allHearingsHref: adjudicationUrls.viewScheduledHearings.urls.start(),
      yourCompletedReportsHref: adjudicationUrls.yourCompletedReports.urls.start(),
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    // const { user } = res.locals
    // if (req.body.cancelHearingButton) {
    //   const hearingIdToCancel = Number(req.body.cancelHearingButton.split('-')[1])
    //   await this.reportedAdjudicationsService.deleteHearing(adjudicationNumber, hearingIdToCancel, user)
    // }
    return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
  }
}
