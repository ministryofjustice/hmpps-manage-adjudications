import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { formatName, possessive } from '../../utils/utils'

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
      adjudicationEdited: true,
      bannerText: `${possessive(prisonerFirstAndLastName)} report has been changed. It will now be reviewed.`,
      yourCompletedReportsLink: adjudicationUrls.yourCompletedReports.urls.start(),
      pageTitle: 'Report change is confirmed',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
