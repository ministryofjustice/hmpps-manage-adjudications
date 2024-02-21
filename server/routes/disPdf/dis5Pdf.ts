import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationHistoryForCurrentSentenceData from '../../data/adjudicationHistoryForCurrentSentenceData'

export default class Dis5Pdf {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const dis5Data = await this.reportedAdjudicationsService.getDis5Data(chargeNumber, user)
    const adjudicationHistoryForCurrentSentenceData = new AdjudicationHistoryForCurrentSentenceData(
      chargeNumber,
      adjudicationDetails,
      dis5Data
    )

    console.log(adjudicationHistoryForCurrentSentenceData)

    res.renderPdf(
      `pages/adjudicationHistoryForCurrentSentence`,
      { adjudicationsUrl, adjudicationHistoryForCurrentSentenceData },
      `pages/adjudicationHistoryForCurrentSentenceHeader`,
      { chargeNumber },
      `pages/adjudicationHistoryForCurrentSentenceFooter`,
      {},
      {
        filename: `adjudication-history-for-current-sentence-${chargeNumber}.pdf`,
        pdfMargins,
      }
    )
  }
}
