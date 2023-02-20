/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { getNextPageForChosenStep, getSchedulingUnavailableStatuses } from './hearingTabHelper'

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

    const history = await this.reportedAdjudicationsService.getHearingHistory(reportedAdjudication.history, user)

    const finalHistoryItem = history.length ? history[history.length - 1] : null

    const isFinalHistoryItemAHearing = finalHistoryItem && Object.keys(finalHistoryItem).includes('location')

    const schedulingNotAvailable = getSchedulingUnavailableStatuses(reportedAdjudication)

    const latestHearingId = reportedAdjudication.hearings?.length
      ? reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].id
      : null

    return res.render(`pages/adjudicationForReport/hearingTab`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudication.status,
      schedulingNotAvailable,
      isAccepted: reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED,
      readOnly: this.pageOptions.isReporter(),
      history,
      finalHistoryItem,
      latestHearingId,
      showRemoveHearingButton: isFinalHistoryItemAHearing,
      allCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      allHearingsHref: adjudicationUrls.viewScheduledHearings.urls.start(),
      yourCompletedReportsHref: adjudicationUrls.yourCompletedReports.urls.start(),
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { removeHearingButton, nextStep } = req.body
    if (removeHearingButton === 'removeHearing') {
      await this.reportedAdjudicationsService.deleteHearing(adjudicationNumber, user)
    }

    if (nextStep) {
      const redirectUrl = getNextPageForChosenStep(nextStep, adjudicationNumber)
      if (redirectUrl) return res.redirect(redirectUrl)
    }

    return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
  }
}
