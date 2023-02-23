/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import OutcomesService from '../../../services/outcomesService'
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

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly outcomesService: OutcomesService
  ) {
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

    const latestHearingId = reportedAdjudication.hearings?.length
      ? reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].id
      : null

    const readOnly = this.pageOptions.isReporter()

    return res.render(`pages/adjudicationForReport/hearingTab`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudication.status,
      schedulingNotAvailable: getSchedulingUnavailableStatuses(reportedAdjudication),
      isAccepted: reportedAdjudication.status === ReportedAdjudicationStatus.ACCEPTED,
      readOnly,
      history,
      latestHearingId,
      secondaryButtonInfo: this.reportedAdjudicationsService.getSecondaryButtonInfoForHearingDetails(
        reportedAdjudication.history,
        readOnly
      ),
      primaryButtonInfo: this.reportedAdjudicationsService.getPrimaryButtonInfoForHearingDetails(
        reportedAdjudication.history,
        readOnly,
        adjudicationNumber
      ),
      allCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      allHearingsHref: adjudicationUrls.viewScheduledHearings.urls.start(),
      yourCompletedReportsHref: adjudicationUrls.yourCompletedReports.urls.start(),
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { removeHearingButton, nextStep, removeReferralButton } = req.body
    if (removeHearingButton) {
      await this.reportedAdjudicationsService.deleteHearing(adjudicationNumber, user)
    }
    if (removeReferralButton) {
      await this.outcomesService.removeReferral(adjudicationNumber, user)
    }

    if (nextStep) {
      const redirectUrl = getNextPageForChosenStep(nextStep, adjudicationNumber)
      if (redirectUrl) return res.redirect(redirectUrl)
    }

    return res.redirect(adjudicationUrls.hearingDetails.urls.review(adjudicationNumber))
  }
}
