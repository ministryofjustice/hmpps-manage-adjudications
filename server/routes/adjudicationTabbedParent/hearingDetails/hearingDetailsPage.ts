/* eslint-disable @typescript-eslint/no-unused-vars */
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

    const hearings = [
      {
        id: 1234,
        dateTimeOfHearing: '2022-10-20T11:11:00',
        locationId: 27187,
      },
      {
        id: 23445,
        dateTimeOfHearing: '2022-10-21T11:11:00',
        locationId: 27187,
      },
    ]

    const hearingSummary = await this.reportedAdjudicationsService.getHearingDetails(hearings, user)
    const readOnly = this.pageOptions.isReporter()

    return res.render(`pages/adjudicationTabbedParent/hearingDetails`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudicationStatusDisplayName(reportedAdjudication.status),
      schedulingAvailable: reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED,
      readOnly,
      hearings: hearingSummary,
      scheduleHearingButtonHref: '#', // TODO set up adjudicationUrl for this
      scheduleHearingButtonText: getScheduleHearingButtonText(hearings.length),
      allCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      yourCompletedReportsHref: adjudicationUrls.yourCompletedReports.urls.start(),
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    if (req.body.cancelHearingButton) {
      const hearingIndexToCancel = req.body.cancelHearingButton.split('-')[1] - 1
      // await this.reportedAdjudicationsService.deleteHearing(adjudicationNumber, hearingIndexToCancel, user)
    }
  }
}
