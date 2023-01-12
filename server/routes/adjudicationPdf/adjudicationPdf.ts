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
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(adjudicationNumber, user)

    const { reportedAdjudication, associatedPrisoner, prisoner } =
      await this.decisionTreeService.reportedAdjudicationIncidentData(adjudicationNumber, user)
    const offences = await this.decisionTreeService.getAdjudicationOffences(
      reportedAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      reportedAdjudication.incidentRole,
      user,
      true
    )

    const noticeOfBeingPlacedOnReportData = new NoticeOfBeingPlacedOnReportData(
      adjudicationNumber,
      adjudicationDetails,
      offences
    )
    res.renderPdf(
      `pages/noticeOfBeingPlacedOnReport`,
      { adjudicationsUrl, noticeOfBeingPlacedOnReportData },
      `pages/noticeOfBeingPlacedOnReportHeader`,
      { adjudicationNumber },
      `pages/noticeOfBeingPlacedOnReportFooter`,
      {},
      {
        filename: `adjudication-report-${adjudicationNumber}`,
        pdfMargins,
      }
    )
  }
}
