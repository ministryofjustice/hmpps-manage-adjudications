/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import OutcomesService from '../../../services/outcomesService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { getNextPageForChosenStep, getSchedulingUnavailableStatuses } from './hearingTabHelper'
import UserService from '../../../services/userService'
import { OutcomeHistory } from '../../../data/HearingAndOutcomeResult'

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
      reportHref: adjudicationUrls.prisonerReport.urls.report(reportedAdjudication.chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.report(reportedAdjudication.chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(reportedAdjudication.chargeNumber),
      formsHref: `${adjudicationUrls.forms.urls.view(reportedAdjudication.chargeNumber)}?path=report`,
    }
  }
  if (pageOptions.isViewOnly()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.viewOnly(reportedAdjudication.chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.viewOnly(reportedAdjudication.chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.viewOnly(reportedAdjudication.chargeNumber),
      formsHref: `${adjudicationUrls.forms.urls.view(reportedAdjudication.chargeNumber)}?path=view`,
    }
  }
  return {
    reportHref: adjudicationUrls.prisonerReport.urls.review(reportedAdjudication.chargeNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.review(reportedAdjudication.chargeNumber),
    punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(reportedAdjudication.chargeNumber),
    formsHref: `${adjudicationUrls.forms.urls.view(reportedAdjudication.chargeNumber)}?path=review`,
  }
}

export default class HearingTabPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly outcomesService: OutcomesService,
    private readonly userService: UserService
  ) {
    this.pageOptions = new PageOptions(pageType)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { chargeNumber } = req.params
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      chargeNumber,
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

    const userRoles = await this.userService.getUserRoles(user.token)
    const showFormsTab = await this.reportedAdjudicationsService.canViewPrintAndIssueFormsTab(
      userRoles,
      reportedAdjudication.status
    )

    return res.render(`pages/adjudicationForReport/hearingTab`, {
      prisoner,
      chargeNumber: reportedAdjudication.chargeNumber,
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
        chargeNumber
      ),
      tertiaryButtonInfo: this.reportedAdjudicationsService.getTertiaryButtonInfoForHearingDetails(
        reportedAdjudication.outcomes,
        readOnly,
        chargeNumber
      ),
      allCompletedReportsHref: adjudicationUrls.allCompletedReports.urls.start(),
      allHearingsHref: adjudicationUrls.viewScheduledHearings.urls.start(),
      yourCompletedReportsHref: adjudicationUrls.yourCompletedReports.urls.start(),
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
      showFormsTab,
      transferBannerContent: getTransferBannerInfo.transferBannerContent,
      showTransferHearingWarning: getTransferBannerInfo.originatingAgencyToAddOutcome,
      overrideAgencyId: reportedAdjudication.overrideAgencyId,
      outcomeRemovable: this.outcomeRemovable(reportedAdjudication.outcomes),
    })
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
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
      await this.outcomesService.removeNotProceedOrQuashed(chargeNumber, user)
    }
    if (removeAdjournHearingOutcomeButton) {
      await this.outcomesService.removeAdjournOutcome(chargeNumber, user)
    }
    if (removeHearingButton) {
      await this.reportedAdjudicationsService.deleteHearing(chargeNumber, user)
    }
    if (removeCompleteHearingOutcomeButton) {
      await this.reportedAdjudicationsService.deleteCompleteHearingOutcome(chargeNumber, user)
    }
    if (removeReferralButton) {
      await this.outcomesService.removeReferral(chargeNumber, user)
    }
    if (nextStep) {
      const redirectUrl = getNextPageForChosenStep(nextStep, chargeNumber)
      if (redirectUrl) return res.redirect(redirectUrl)
    }

    return res.redirect(adjudicationUrls.hearingDetails.urls.review(chargeNumber))
  }

  outcomeRemovable = (outcomes: OutcomeHistory) => {
    if (!outcomes || !outcomes.length) return false
    // This is an additional check, if 'canRemove' is undefined or null, it'll
    // return true as it did before we had this flag, but if it's false, it will return false
    return outcomes[outcomes.length - 1]?.outcome?.outcome?.canRemove ?? true
  }
}
