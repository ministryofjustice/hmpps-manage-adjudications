import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import config from '../../config'
import PrepareAndRecordAnAdjudicationHearingData from '../../data/prepareAndRecordAnAdjudicationHearingData'
import DecisionTreeService from '../../services/decisionTreeService'

export default class Dis3Pdf {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { user } = res.locals
    const { pdfMargins, adjudicationsUrl } = config.apis.gotenberg
    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)

    const { reportedAdjudication, associatedPrisoner, prisoner } =
      await this.decisionTreeService.reportedAdjudicationIncidentData(chargeNumber, user)
    const offences = await this.decisionTreeService.getAdjudicationOffences(
      reportedAdjudication.offenceDetails,
      prisoner,
      associatedPrisoner,
      reportedAdjudication.incidentRole,
      user,
      true
    )

    const prepareAndRecordAnAdjudicationHearingData = new PrepareAndRecordAnAdjudicationHearingData(
      chargeNumber,
      adjudicationDetails,
      offences
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
      }
    )
  }
}
