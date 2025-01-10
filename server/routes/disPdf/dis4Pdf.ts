import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationHearingContinuationData from '../../data/adjudicationHearingContinuationData'
import { withRetry } from '../../utils/withRetry'
import log from '../../log'

export default class Dis4Pdf {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg

    try {
      const adjudicationDetails = await withRetry(() =>
        this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)
      )

      // Validate completeness of data
      if (!adjudicationDetails) {
        throw new Error('Incomplete data for PDF rendering')
      }

      const adjudicationHearingContinuationData = new AdjudicationHearingContinuationData(
        chargeNumber,
        adjudicationDetails
      )

      res.renderPdf(
        `pages/adjudicationHearingContinuation`,
        { adjudicationsUrl, adjudicationHearingContinuationData },
        `pages/adjudicationHearingContinuationHeader`,
        {},
        `pages/adjudicationHearingContinuationFooter`,
        { chargeNumber },
        {
          filename: `adjudication-hearing-continuation-${chargeNumber}.pdf`,
          pdfMargins,
        }
      )
    } catch (error) {
      log.error('Error rendering PDF:', error)
      res.status(500).send('Failed to generate PDF.')
    }
  }
}
