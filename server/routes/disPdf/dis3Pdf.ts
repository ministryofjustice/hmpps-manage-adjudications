import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import PrepareAndRecordAnAdjudicationHearingData from '../../data/prepareAndRecordAnAdjudicationHearingData'
import DecisionTreeService from '../../services/decisionTreeService'
import { getEvidenceCategory } from '../../utils/utils'
import log from '../../log'
import { withRetry } from '../../utils/withRetry'

export default class Dis3Pdf {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService,
  ) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg

    try {
      const adjudicationDetails = await withRetry(() =>
        this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user),
      )
      const { reportedAdjudication, associatedPrisoner, prisoner } = await withRetry(() =>
        this.decisionTreeService.reportedAdjudicationIncidentData(chargeNumber, user),
      )

      const offences = await withRetry(() =>
        this.decisionTreeService.getAdjudicationOffences(
          reportedAdjudication.offenceDetails,
          prisoner,
          associatedPrisoner,
          reportedAdjudication.incidentRole,
          user,
          true,
        ),
      )

      // Validate completeness of data
      if (!adjudicationDetails || !reportedAdjudication || !offences) {
        throw new Error('Incomplete data for PDF rendering')
      }

      const { damages, evidence, witnesses } = reportedAdjudication
      const [photoVideo, baggedAndTagged, other] = await Promise.all([
        getEvidenceCategory(evidence, false, false),
        getEvidenceCategory(evidence, true, false),
        getEvidenceCategory(evidence, false, true),
      ])

      const prepareAndRecordAnAdjudicationHearingData = new PrepareAndRecordAnAdjudicationHearingData(
        chargeNumber,
        adjudicationDetails,
        offences,
        damages,
        { photoVideo, baggedAndTagged, other },
        witnesses,
      )

      res.renderPdf(
        `pages/prepareAndRecordAnAdjudicationHearing`,
        { adjudicationsUrl, prepareAndRecordAnAdjudicationHearingData },
        `pages/prepareAndRecordAnAdjudicationHearingHeader`,
        { chargeNumber },
        `pages/prepareAndRecordAnAdjudicationHearingFooter`,
        {},
        {
          filename: `prepare-and-record-adjudication-hearing-${chargeNumber}.pdf`,
          pdfMargins,
        },
      )
    } catch (error) {
      log.error('Error rendering PDF:', error)
      res.status(500).send('Failed to generate PDF.')
    }
  }
}
