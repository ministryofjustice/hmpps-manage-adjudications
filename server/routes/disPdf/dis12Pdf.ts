import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import NoticeOfBeingPlacedOnReportData from '../../data/noticeOfBeingPlacedOnReportData'
import config from '../../config'
import DecisionTreeService from '../../services/decisionTreeService'
import { ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import { withRetry } from '../../utils/withRetry'
import log from '../../log'

export default class Dis12Pdf {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService,
  ) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { copy } = req.query
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg

    try {
      // Retry fetching data to avoid intermittent failures
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

      const isPrisonerCopy = copy === 'prisoner'
      const scheduledHearings =
        reportedAdjudication.status === ReportedAdjudicationStatus.SCHEDULED &&
        reportedAdjudication.hearings.length >= 2

      let nextHearingDateTime
      if (isPrisonerCopy && scheduledHearings) {
        nextHearingDateTime = reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].dateTimeOfHearing
      }

      const noticeOfBeingPlacedOnReportData = new NoticeOfBeingPlacedOnReportData(
        isPrisonerCopy,
        chargeNumber,
        adjudicationDetails,
        offences,
        nextHearingDateTime,
        reportedAdjudication.createdOnBehalfOfOfficer,
      )

      res.renderPdf(
        `pages/noticeOfBeingPlacedOnReport`,
        { adjudicationsUrl, noticeOfBeingPlacedOnReportData },
        `pages/noticeOfBeingPlacedOnReportHeader`,
        { chargeNumber },
        `pages/noticeOfBeingPlacedOnReportFooter`,
        {},
        {
          filename: `notice-of-being-placed-on-report-${chargeNumber}.pdf`,
          pdfMargins,
        },
      )
    } catch (error) {
      log.error('Error rendering PDF:', error)
      res.status(500).send('Failed to generate PDF.')
    }
  }
}
