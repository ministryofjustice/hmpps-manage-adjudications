import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import AdjudicationResultReportData from '../../data/adjudicationResultReportData'
import { withRetry } from '../../utils/withRetry'
import log from '../../log'
import { calculateAge } from '../../utils/utils'

export default class Dis7Pdf {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg

    try {
      const adjudicationDetails = await withRetry(() =>
        this.reportedAdjudicationsService.getDetailsForDIS7(chargeNumber, user),
      )

      // Validate completeness of data
      if (!adjudicationDetails) {
        throw new Error('Incomplete data for PDF rendering')
      }

      const prisoner = await withRetry(() =>
        this.reportedAdjudicationsService.getPrisonerDetails(adjudicationDetails.prisonerNumber, user),
      )
      const prisonerDateOfBirth = new Date(prisoner.dateOfBirth).toLocaleDateString('en-GB')
      const prisonerAge = calculateAge(prisoner.dateOfBirth, adjudicationDetails.incidentDate)

      const adjudicationResultReportData = new AdjudicationResultReportData(
        chargeNumber,
        adjudicationDetails,
        prisonerDateOfBirth,
        prisonerAge,
      )
      const header = 'Result of your adjudication'

      res.renderPdf(
        `pages/adjudicationResultReport`,
        { adjudicationsUrl, data: adjudicationResultReportData },
        `pages/adjudicationResultReportHeader`,
        { chargeNumber, header },
        `pages/adjudicationResultReportFooter`,
        {},
        {
          filename: `adjudication-result-${chargeNumber}.pdf`,
          pdfMargins,
        },
      )
    } catch (error) {
      log.error('Error rendering PDF:', error)
      res.status(500).send('Failed to generate PDF.')
    }
  }
}
