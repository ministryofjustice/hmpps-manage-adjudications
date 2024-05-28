/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import { flattenPunishments } from '../../../data/PunishmentResult'
import UserService from '../../../services/userService'
import config from '../../../config'

export enum PageRequestType {
  REPORTER,
  REVIEWER,
  VIEW,
}

class PageOptions {
  constructor(private readonly pageType: PageRequestType) {}

  isReviewer(): boolean {
    return this.pageType === PageRequestType.REVIEWER
  }

  isReporter(): boolean {
    return this.pageType === PageRequestType.REPORTER
  }

  isViewOnly(): boolean {
    return this.pageType === PageRequestType.VIEW
  }
}

const getVariablesForPageType = (pageOptions: PageOptions, reportedAdjudication: ReportedAdjudication) => {
  if (pageOptions.isViewOnly()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.viewOnly(reportedAdjudication.chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.viewOnly(reportedAdjudication.chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.viewOnly(reportedAdjudication.chargeNumber),
      formsHref: `${adjudicationUrls.forms.urls.view(reportedAdjudication.chargeNumber)}?path=view`,
    }
  }
  if (pageOptions.isReporter()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.report(reportedAdjudication.chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.report(reportedAdjudication.chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(reportedAdjudication.chargeNumber),
      formsHref: `${adjudicationUrls.forms.urls.view(reportedAdjudication.chargeNumber)}?path=report`,
    }
  }
  return {
    reportHref: adjudicationUrls.prisonerReport.urls.review(reportedAdjudication.chargeNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.review(reportedAdjudication.chargeNumber),
    punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(reportedAdjudication.chargeNumber),
    formsHref: `${adjudicationUrls.forms.urls.view(reportedAdjudication.chargeNumber)}?path=review`,
  }
}

export default class PunishmentsTabPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly punishmentsService: PunishmentsService,
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
    const readOnly = this.isReadOnly(reportedAdjudication)

    const punishments = flattenPunishments(await this.punishmentsService.getPunishmentsFromServer(chargeNumber, user))
    const filteredPunishments = await this.punishmentsService.filteredPunishments(punishments)

    const punishmentComments = await this.punishmentsService.formatPunishmentComments(
      reportedAdjudication,
      chargeNumber,
      user
    )

    const getTransferBannerInfo = await this.reportedAdjudicationsService.getTransferBannerInfo(
      reportedAdjudication,
      user
    )

    const userRoles = await this.userService.getUserRoles(user.token)
    const showFormsTab = await this.reportedAdjudicationsService.canViewPrintAndIssueFormsTab(
      userRoles,
      reportedAdjudication.status
    )

    const rehabActivities = await this.punishmentsService.getRehabActivitiesFromServer(chargeNumber, user)
    return res.render(`pages/adjudicationForReport/punishmentsTab.njk`, {
      prisoner,
      chargeNumber: reportedAdjudication.chargeNumber,
      reviewStatus: reportedAdjudication.status,
      readOnly,
      isReporter: this.pageOptions.isReporter(),
      outcomeEnteredInNomis: reportedAdjudication.outcomeEnteredInNomis,
      chargeProved: reportedAdjudication.status === ReportedAdjudicationStatus.CHARGE_PROVED,
      corrupted:
        reportedAdjudication.status === ReportedAdjudicationStatus.INVALID_OUTCOME ||
        reportedAdjudication.status === ReportedAdjudicationStatus.INVALID_SUSPENDED ||
        reportedAdjudication.status === ReportedAdjudicationStatus.INVALID_ADA,
      quashed: reportedAdjudication.status === ReportedAdjudicationStatus.QUASHED,
      punishments,
      filteredPunishments,
      consecutiveReportLinkAvailable: this.pageOptions.isReviewer(),
      punishmentComments,
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
      showFormsTab,
      transferBannerContent: getTransferBannerInfo.transferBannerContent,
      showTransferHearingWarning: getTransferBannerInfo.originatingAgencyToAddOutcome,
      overrideAgencyId: reportedAdjudication.overrideAgencyId,
      paybackAndRehabFlag: config.paybackAndRehabFlag === 'true',
      rehabActivities,
    })
  }

  private isReadOnly = (reportedAdjudication: ReportedAdjudication) => {
    if (
      this.pageOptions.isReporter() ||
      this.pageOptions.isViewOnly() ||
      reportedAdjudication?.outcomeEnteredInNomis === true
    )
      return true
    return false
  }
}
