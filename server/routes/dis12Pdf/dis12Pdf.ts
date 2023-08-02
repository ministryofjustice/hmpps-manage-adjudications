import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import NoticeOfBeingPlacedOnReportData from '../../data/noticeOfBeingPlacedOnReportData'
import config from '../../config'
import DecisionTreeService from '../../services/decisionTreeService'

export default class AdjudicationPdf {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
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

    const noticeOfBeingPlacedOnReportData = new NoticeOfBeingPlacedOnReportData(
      chargeNumber,
      adjudicationDetails,
      offences
    )
    res.renderPdf(
      `pages/noticeOfBeingPlacedOnReport`,
      { adjudicationsUrl, noticeOfBeingPlacedOnReportData },
      `pages/noticeOfBeingPlacedOnReportHeader`,
      { chargeNumber },
      `pages/noticeOfBeingPlacedOnReportFooter`,
      {},
      {
        filename: `adjudication-report-${chargeNumber}`,
        pdfMargins,
      }
    )
  }
}
