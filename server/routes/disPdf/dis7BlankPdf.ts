import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import { AdjudicationResultReportDataBlank } from '../../data/adjudicationResultReportDataBlank'
import { withRetry } from '../../utils/withRetry'
import { calculateAge } from '../../utils/utils'
import log from '../../log'

export default class Dis7PdfBlank {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg

    try {
      const adjudicationDetails = await withRetry(() =>
        this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user),
      )

      const prisoner = await withRetry(() =>
        this.reportedAdjudicationsService.getPrisonerDetails(adjudicationDetails.prisonerNumber, user),
      )
      const prisonerDateOfBirth = new Date(prisoner.dateOfBirth).toLocaleDateString('en-GB')

      const prisonerAge = calculateAge(prisoner.dateOfBirth, adjudicationDetails.incidentDate)

      // Validate completeness of data
      if (!adjudicationDetails) {
        throw new Error('Incomplete data for PDF rendering')
      }

      const header = adjudicationDetails.isYouthOffender
        ? 'Adjudication result – Young Offender (YOI Rule 55)'
        : 'Adjudication result – Adult (Prison Rule 51)'
      const adjudicationResultReportDataBlank = new AdjudicationResultReportDataBlank(
        chargeNumber,
        adjudicationDetails,
        prisonerDateOfBirth,
        prisonerAge,
      )
      res.renderPdf(
        `pages/adjudicationResultReportBlank`,
        { adjudicationsUrl, data: adjudicationResultReportDataBlank },
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
