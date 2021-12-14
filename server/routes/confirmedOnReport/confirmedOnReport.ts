import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { formatName, formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'

export default class ConfirmedOnReportRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber } = req.params
    const { user } = res.locals

    const adjudicationNumberValue: number = parseInt(adjudicationNumber as string, 10)
    if (Number.isNaN(adjudicationNumberValue)) {
      throw new Error('No adjudication number provided')
    }

    const adjudicationDetails = await this.reportedAdjudicationsService.getEnhancedConfirmationDetails(
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
      showPrisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage != null,
      prisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage,
      showPrisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages?.length > 0,
      prisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages,
      showPrisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities?.length > 0,
      prisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities,
      printHref: `/print-report/${adjudicationNumber}`,
      adjudicationEdited: false,
      editedByReviewer: false,
      bannerText: `${prisonerFirstAndLastName} has been placed on report`,
      bannerHTML: `Your report number is: <br><strong>${adjudicationNumber}</strong>`,
      buttonClass: 'govuk-button--secondary',
      buttonHref: '/place-a-prisoner-on-report',
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
