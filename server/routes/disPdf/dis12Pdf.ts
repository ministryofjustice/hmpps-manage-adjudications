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

    const isRelevantCopy = copy === 'prisoner' || copy === 'staff'
    const scheduledHearings =
      reportedAdjudication.status === ReportedAdjudicationStatus.SCHEDULED && reportedAdjudication.hearings.length >= 1

    let nextHearingDateTime
    if (isRelevantCopy && scheduledHearings) {
      nextHearingDateTime = reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].dateTimeOfHearing
    }
    logger.info(`isPrisonerCopy -> ${isRelevantCopy}`)
    logger.info(`scheduledHearings -> ${scheduledHearings}`)
    logger.info(`nextHearingDateTime -> ${nextHearingDateTime}`)
    logger.info(`reportedAdjudication -> ${JSON.stringify(reportedAdjudication, null, 2)}`)
    logger.info(`reportedAdjudication.hearings -> ${JSON.stringify(reportedAdjudication.hearings, null, 2)}`)
    logger.info(`ReportedAdjudicationStatus.SCHEDULED -> ${ReportedAdjudicationStatus.SCHEDULED}`)
    logger.info(`reportedAdjudication.status -> ${reportedAdjudication.status}`)

    const noticeOfBeingPlacedOnReportData = new NoticeOfBeingPlacedOnReportData(
      isRelevantCopy,
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
