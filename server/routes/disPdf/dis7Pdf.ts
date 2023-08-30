import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationResultReportData from '../../data/adjudicationResultReportData'
import { User } from '../../data/hmppsManageUsersClient'

export default class Dis6Pdf {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const isYOI = await this.getYoiInfo(chargeNumber, user)
    const header = isYOI ? 'Young Offender (YOI Rule 55)' : 'Adult (Prison Rule 51)'
    const adjudicationResultReportData = new AdjudicationResultReportData(chargeNumber, adjudicationDetails, isYOI)

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

  getYoiInfo = async (chargeNumber: string, user: User): Promise<boolean> => {
    const adjudication = await this.reportedAdjudicationsService.getReportedAdjudicationDetails(chargeNumber, user)
    const { reportedAdjudication } = adjudication
    return reportedAdjudication.isYouthOffender
  }
}
