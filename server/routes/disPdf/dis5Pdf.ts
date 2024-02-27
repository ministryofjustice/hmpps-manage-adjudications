import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationHistoryForCurrentSentenceData from '../../data/adjudicationHistoryForCurrentSentenceData'
import PrisonerSearchService from '../../services/prisonerSearchService'

export default class Dis5Pdf {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly prisonerSearchService: PrisonerSearchService
  ) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const prisonerSearchDis5Data = await this.prisonerSearchService.getPrisonerDetailsForDis5(
      adjudicationDetails.prisonerNumber,
      user
    )
    const dis5Data = await this.reportedAdjudicationsService.getDis5Data(
      chargeNumber,
      adjudicationDetails.prisonerNumber,
      adjudicationDetails.bookingId,
      user
    )
    const adjudicationHistoryForCurrentSentenceData = new AdjudicationHistoryForCurrentSentenceData(
      chargeNumber,
      adjudicationDetails,
      dis5Data,
      prisonerSearchDis5Data
    )
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
