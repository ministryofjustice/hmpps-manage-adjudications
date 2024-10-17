import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import NoticeOfBeingPlacedOnReportData from '../../data/noticeOfBeingPlacedOnReportData'
import config from '../../config'
import DecisionTreeService from '../../services/decisionTreeService'
import { ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import logger from '../../../logger'

export default class Dis12Pdf {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { copy } = req.query
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const { reportedAdjudication, associatedPrisoner, prisoner } =
      await this.decisionTreeService.reportedAdjudicationIncidentData(chargeNumber, user)
    const offences = await this.decisionTreeService.getAdjudicationOffences(
      reportedAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      reportedAdjudication.incidentRole,
      user,
      true
    )

    const isPrisonerCopy = copy === 'prisoner'
    const scheduledHearings =
      reportedAdjudication.status.toLowerCase() === ReportedAdjudicationStatus.SCHEDULED.toLowerCase() &&
      reportedAdjudication.hearings.length >= 2
    let nextHearingDateTime
    if (isPrisonerCopy && scheduledHearings) {
      nextHearingDateTime = reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].dateTimeOfHearing
    }
    logger.info(`isPrisonerCopy -> ${isPrisonerCopy}`)
    logger.info(`scheduledHearings -> ${scheduledHearings}`)
    logger.info(`nextHearingDateTime -> ${nextHearingDateTime}`)
    logger.info(`reportedAdjudication -> ${reportedAdjudication}`)
    logger.info(`reportedAdjudication.hearings -> ${reportedAdjudication.hearings}`)
    logger.info(`ReportedAdjudicationStatus.SCHEDULED -> ${ReportedAdjudicationStatus.SCHEDULED}`)
    logger.info(`reportedAdjudication.status -> ${reportedAdjudication.status}`)

    const noticeOfBeingPlacedOnReportData = new NoticeOfBeingPlacedOnReportData(
      isPrisonerCopy,
      chargeNumber,
      adjudicationDetails,
      offences,
      nextHearingDateTime
    )

    res.renderPdf(
      `pages/noticeOfBeingPlacedOnReport`,
      { adjudicationsUrl, noticeOfBeingPlacedOnReportData },
      `pages/noticeOfBeingPlacedOnReportHeader`,
      { chargeNumber },
      `pages/noticeOfBeingPlacedOnReportFooter`,
      {},
      {
        filename: `notice-of-being-placed-on-report-${chargeNumber}.pdf`,
        pdfMargins,
      }
    )
  }
}
