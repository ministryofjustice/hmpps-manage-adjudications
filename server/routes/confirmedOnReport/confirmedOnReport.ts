import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { formatName } from '../../utils/utils'

export default class ConfirmedOnReportRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const adjudicationNumber = Number(req.params.adjudicationNumber)
    const { user } = res.locals

    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(adjudicationNumber, user)

    const prisonerFirstAndLastName = formatName(
      adjudicationDetails.prisonerFirstName,
      adjudicationDetails.prisonerLastName
    )

    return res.render(`pages/confirmedOnReport`, {
      adjudicationEdited: false,
      bannerText: `Your report for ${prisonerFirstAndLastName} has been submitted for review`,
      yourCompletedReportsLink: adjudicationUrls.yourCompletedReports.urls.start(),
      pageTitle: 'Report submitted for review',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
