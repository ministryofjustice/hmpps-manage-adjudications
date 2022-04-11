import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { homepage } from '../../utils/urlGenerator'
import { formatName, formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'

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
      adjudicationNumber,
      expirationTime: formatTimestampToTime(adjudicationDetails.reportExpirationDateTime),
      expirationDay: formatTimestampToDate(adjudicationDetails.reportExpirationDateTime, 'D MMMM YYYY'),
      prisonerFirstAndLastName,
      showPrisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage != null,
      prisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage,
      showPrisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages?.length > 0,
      prisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages,
      showPrisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities?.length > 0,
      prisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities,
      adjudicationEdited: false,
      editedByReviewer: false,
      bannerText: `${prisonerFirstAndLastName} has been placed on report`,
      bannerHTML: `Your report number is: <br><strong>${adjudicationNumber}</strong>`,
      buttonClass: 'govuk-button--secondary',
      buttonHref: homepage.root,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
