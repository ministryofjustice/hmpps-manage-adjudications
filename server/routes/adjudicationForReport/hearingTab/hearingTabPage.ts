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
  VIEW,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isReporter(): boolean {
    return this.pageType === PageRequestType.REPORTER
  }

  isViewOnly(): boolean {
    return this.pageType === PageRequestType.VIEW
  }
}

const getVariablesForPageType = (pageOptions: PageOptions, reportedAdjudication: ReportedAdjudication) => {
  if (pageOptions.isReporter()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.report(reportedAdjudication.adjudicationNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.report(reportedAdjudication.adjudicationNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(reportedAdjudication.adjudicationNumber),
    }
  }
  if (pageOptions.isViewOnly()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.viewOnly(reportedAdjudication.adjudicationNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.viewOnly(reportedAdjudication.adjudicationNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.viewOnly(reportedAdjudication.adjudicationNumber),
    }
  }
  return {
    reportHref: adjudicationUrls.prisonerReport.urls.review(reportedAdjudication.adjudicationNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.review(reportedAdjudication.adjudicationNumber),
    punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(reportedAdjudication.adjudicationNumber),
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

    const history = await this.reportedAdjudicationsService.getOutcomesHistory(reportedAdjudication.outcomes, user)
    const latestHearingId = reportedAdjudication.hearings?.length
      ? reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].id
      : null
    const readOnly =
      this.pageOptions.isReporter() || this.pageOptions.isViewOnly() || reportedAdjudication.outcomeEnteredInNomis

    const getTransferBannerInfo = await this.reportedAdjudicationsService.getTransferBannerInfo(
      reportedAdjudication,
      user
    )

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
        reportedAdjudication.outcomes,
        readOnly
      ),
      primaryButtonInfo: this.reportedAdjudicationsService.getPrimaryButtonInfoForHearingDetails(
        reportedAdjudication.outcomes,
        readOnly,
        adjudicationNumber
      ),
      tertiaryButtonInfo: this.reportedAdjudicationsService.getTertiaryButtonInfoForHearingDetails(
        reportedAdjudication.outcomes,
        readOnly,
        adjudicationNumber
      ),
      allCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      allHearingsHref: adjudicationUrls.viewScheduledHearings.urls.start(),
      yourCompletedReportsHref: adjudicationUrls.yourCompletedReports.urls.start(),
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
      transferBannerContent: getTransferBannerInfo.transferBannerContent,
      showTransferHearingWarning: getTransferBannerInfo.originatingAgencyToAddOutcome,
      overrideAgencyId: reportedAdjudication.overrideAgencyId,
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const {
      removeHearingButton,
      removeCompleteHearingOutcomeButton,
      nextStep,
      removeReferralButton,
      removeOutcomeButton,
      removeAdjournHearingOutcomeButton,
      removeQuashedFindingButton,
    } = req.body
    if (removeOutcomeButton || removeQuashedFindingButton) {
      await this.outcomesService.removeNotProceedOrQuashed(adjudicationNumber, user)
    }
    if (removeAdjournHearingOutcomeButton) {
      await this.outcomesService.removeAdjournOutcome(adjudicationNumber, user)
    }
    if (removeHearingButton) {
      await this.reportedAdjudicationsService.deleteHearing(adjudicationNumber, user)
    }
    if (removeCompleteHearingOutcomeButton) {
      await this.reportedAdjudicationsService.deleteCompleteHearingOutcome(adjudicationNumber, user)
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
