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
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { copy } = req.query
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg

    try {
      // Retry fetching data to avoid intermittent failures
      const adjudicationDetails = await withRetry(() =>
        this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)
      )
      log.info(`adjudicationDetails - ${JSON.stringify(adjudicationDetails)}`)

      const { reportedAdjudication, associatedPrisoner, prisoner } = await withRetry(() =>
        this.decisionTreeService.reportedAdjudicationIncidentData(chargeNumber, user)
      )
      log.info(`reportedAdjudication - ${JSON.stringify(reportedAdjudication)}`)
      log.info(`associatedPrisoner - ${JSON.stringify(associatedPrisoner)}`)
      log.info(`prisoner - ${JSON.stringify(prisoner)}`)

      const offences = await withRetry(() =>
        this.decisionTreeService.getAdjudicationOffences(
          reportedAdjudication.offenceDetails,
          prisoner,
          associatedPrisoner,
          reportedAdjudication.incidentRole,
          user,
          true
        )
      )
      log.info(`offences - ${JSON.stringify(offences)}`)

      // Validate completeness of data
      if (!adjudicationDetails || !reportedAdjudication || !offences) {
        throw new Error('Incomplete data for PDF rendering')
      }

      const isPrisonerCopy = copy === 'prisoner'
      const scheduledHearings =
        reportedAdjudication.status === ReportedAdjudicationStatus.SCHEDULED &&
        reportedAdjudication.hearings.length >= 2
      log.info(`reportedAdjudication.hearings - ${JSON.stringify(reportedAdjudication.hearings)}`)
      log.info(`isPrisonerCopy - ${isPrisonerCopy}`)
      log.info(`scheduledHearings - ${scheduledHearings}`)

      let nextHearingDateTime
      if (isPrisonerCopy && scheduledHearings) {
        nextHearingDateTime = reportedAdjudication.hearings[reportedAdjudication.hearings.length - 1].dateTimeOfHearing
      }

      const noticeOfBeingPlacedOnReportData = new NoticeOfBeingPlacedOnReportData(
        isPrisonerCopy,
        chargeNumber,
        adjudicationDetails,
        offences,
        nextHearingDateTime
      )
      log.info(`noticeOfBeingPlacedOnReportData - ${JSON.stringify(noticeOfBeingPlacedOnReportData)}`)

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
        }
      )
    } catch (error) {
      log.error('Error rendering PDF:', error)
      res.status(500).send('Failed to generate PDF.')
    }
  }
}
