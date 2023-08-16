/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import { flattenPunishments } from '../../../data/PunishmentResult'

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
    }
  }
  if (pageOptions.isReporter()) {
    return {
      reportHref: adjudicationUrls.prisonerReport.urls.report(reportedAdjudication.chargeNumber),
      hearingsHref: adjudicationUrls.hearingDetails.urls.report(reportedAdjudication.chargeNumber),
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(reportedAdjudication.chargeNumber),
    }
  }
  return {
    reportHref: adjudicationUrls.prisonerReport.urls.review(reportedAdjudication.chargeNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.review(reportedAdjudication.chargeNumber),
    punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(reportedAdjudication.chargeNumber),
  }
}

export default class PunishmentsTabPage {
  pageOptions: PageOptions

  constructor(
    pageType: PageRequestType,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly punishmentsService: PunishmentsService
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
    const readOnly =
      this.pageOptions.isReporter() || this.pageOptions.isViewOnly() || reportedAdjudication.outcomeEnteredInNomis

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

    return res.render(`pages/adjudicationForReport/punishmentsTab.njk`, {
      prisoner,
      reportNo: reportedAdjudication.chargeNumber,
      reviewStatus: reportedAdjudication.status,
      readOnly,
      isReporter: this.pageOptions.isReporter(),
      outcomeEnteredInNomis: reportedAdjudication.outcomeEnteredInNomis,
      chargeProved: reportedAdjudication.status === ReportedAdjudicationStatus.CHARGE_PROVED,
      quashed: reportedAdjudication.status === ReportedAdjudicationStatus.QUASHED,
      punishments,
      filteredPunishments,
      consecutiveReportLinkAvailable: this.pageOptions.isReviewer(),
      punishmentComments,
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
      transferBannerContent: getTransferBannerInfo.transferBannerContent,
      showTransferHearingWarning: getTransferBannerInfo.originatingAgencyToAddOutcome,
      overrideAgencyId: reportedAdjudication.overrideAgencyId,
    })
  }
}
