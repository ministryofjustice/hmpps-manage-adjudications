import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import ConductReportData from '../../data/conductReportData'

export default class Dis6Pdf {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const conductReportData = new ConductReportData(chargeNumber, adjudicationDetails)

    res.renderPdf(
      `pages/conductReport`,
      { adjudicationsUrl, conductReportData },
      `pages/conductReportHeader`,
      { chargeNumber },
      `pages/conductReportFooter`,
      {},
      {
        filename: `conduct-report-${chargeNumber}.pdf`,
        pdfMargins,
      },
      config.paybackAndRehabFlag === 'true'
    )
  }
}
