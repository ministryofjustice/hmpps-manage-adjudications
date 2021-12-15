import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { formatName, formatTimestampToDate, formatTimestampToTime, possessive } from '../../utils/utils'

export default class ConfirmedOnReportChangeReportRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber } = req.params
    const { user } = res.locals

    const adjudicationNumberValue: number = parseInt(adjudicationNumber as string, 10)
    if (Number.isNaN(adjudicationNumberValue)) {
      throw new Error('No adjudication number provided')
    }

    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetailsChangedReport(
      adjudicationNumberValue,
      user
    )

    const prisonerFirstAndLastName = formatName(
      adjudicationDetails.prisonerFirstName,
      adjudicationDetails.prisonerLastName
    )

    return res.render(`pages/confirmedOnReport`, {
      adjudicationNumber: adjudicationNumberValue,
      expirationTime: formatTimestampToTime(adjudicationDetails.reportExpirationDateTime),
      expirationDay: formatTimestampToDate(adjudicationDetails.reportExpirationDateTime, 'D MMMM YYYY'),
      prisonerFirstAndLastName,
      adjudicationEdited: true,
      editedByReviewer: false,
      bannerText: `${possessive(prisonerFirstAndLastName)} report has been changed`,
      bannerHTML: null,
      buttonClass: 'govuk-button',
      buttonHref: `/prisoner-report/${adjudicationDetails.prisonerNumber}/${adjudicationNumber}/report`,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
