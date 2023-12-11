import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationResultReportData from '../../data/adjudicationResultReportData'

export default class Dis7Pdf {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getDetailsForDIS7(chargeNumber, user)

    const adjudicationResultReportData = new AdjudicationResultReportData(chargeNumber, adjudicationDetails)
    const header = 'Result of your adjudication'

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
