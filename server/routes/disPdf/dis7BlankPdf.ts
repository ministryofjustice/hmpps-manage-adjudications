import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationResultReportDataBlank from '../../data/adjudicationResultReportDataBlank'

export default class Dis7PdfBlank {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const header = adjudicationDetails.isYouthOffender
      ? 'Adjudication result – Young Offender (YOI Rule 55)'
      : 'Adjudication result – Adult (Prison Rule 51)'
    const adjudicationResultReportDataBlank = new AdjudicationResultReportDataBlank(chargeNumber, adjudicationDetails)
    const latestVersion: boolean = config.paybackAndRehabFlag === 'true'

    res.renderPdf(
      `pages/adjudicationResultReportBlank`,
      { adjudicationsUrl, data: adjudicationResultReportDataBlank, latestVersion },
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
