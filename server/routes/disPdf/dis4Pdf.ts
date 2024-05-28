import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationHearingContinuationData from '../../data/adjudicationHearingContinuationData'

export default class Dis4Pdf {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const adjudicationHearingContinuationData = new AdjudicationHearingContinuationData(
      chargeNumber,
      adjudicationDetails
    )
    const latestVersion: boolean = config.paybackAndRehabFlag === 'true'

    res.renderPdf(
      `pages/adjudicationHearingContinuation`,
      { adjudicationsUrl, adjudicationHearingContinuationData, latestVersion },
      `pages/adjudicationHearingContinuationHeader`,
      {},
      `pages/adjudicationHearingContinuationFooter`,
      { chargeNumber },
      {
        filename: `adjudication-hearing-continuation-${chargeNumber}.pdf`,
        pdfMargins,
      }
    )
  }
}
