import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationResultReportData from '../../data/adjudicationResultReportData'

export default class Dis6Pdf {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const adjudicationResultReportData = new AdjudicationResultReportData(chargeNumber, adjudicationDetails)
    const isYOI = false
    const header = isYOI ? 'Young Offender (YOI Rule 55)' : 'Adult (Prison Rule 51)'

    res.renderPdf(
      `pages/adjudicationResultReport`,
      { adjudicationsUrl, adjudicationResultReportData },
      `pages/adjudicationResultReportHeader`,
      { chargeNumber, header },
      `pages/adjudicationResultReportFooter`,
      {},
      {
        filename: `adjudication-result-${chargeNumber}.pdf`,
        pdfMargins,
      }
    )
  }
}