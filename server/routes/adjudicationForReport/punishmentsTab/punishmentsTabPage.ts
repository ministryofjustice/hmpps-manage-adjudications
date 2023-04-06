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
      punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.report(reportedAdjudication.adjudicationNumber),
    }
  }
  return {
    reportHref: adjudicationUrls.prisonerReport.urls.review(reportedAdjudication.adjudicationNumber),
    hearingsHref: adjudicationUrls.hearingDetails.urls.review(reportedAdjudication.adjudicationNumber),
    punishmentsHref: adjudicationUrls.punishmentsAndDamages.urls.review(reportedAdjudication.adjudicationNumber),
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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { reportedAdjudication } = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(
      adjudicationNumber,
      user
    )

    const prisoner = await this.reportedAdjudicationsService.getPrisonerDetails(
      reportedAdjudication.prisonerNumber,
      user
    )
    const readOnly = this.pageOptions.isReporter()

    const finalOutcomeItem = await this.reportedAdjudicationsService.getLastOutcomeItem(
      adjudicationNumber,
      [ReportedAdjudicationStatus.CHARGE_PROVED],
      user
    )
    const amount = finalOutcomeItem.outcome?.outcome?.amount || false
    const caution = finalOutcomeItem.outcome?.outcome?.caution || false

    const punishments = flattenPunishments(
      await this.punishmentsService.getPunishmentsFromServer(adjudicationNumber, user)
    )

    return res.render(`pages/adjudicationForReport/punishmentsTab.njk`, {
      prisoner,
      reportNo: reportedAdjudication.adjudicationNumber,
      reviewStatus: reportedAdjudication.status,
      readOnly,
      chargeProved: reportedAdjudication.status === ReportedAdjudicationStatus.CHARGE_PROVED,
      moneyRecoveredBoolean: !!amount,
      moneyRecoveredAmount: amount && amount.toFixed(2),
      caution,
      moneyChangeLinkHref: adjudicationUrls.moneyRecoveredForDamages.urls.edit(adjudicationNumber),
      cautionChangeLinkHref: adjudicationUrls.isThisACaution.urls.edit(adjudicationNumber),
      punishments,
      ...getVariablesForPageType(this.pageOptions, reportedAdjudication),
    })
  }
}
