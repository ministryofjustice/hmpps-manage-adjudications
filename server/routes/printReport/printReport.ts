import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { formatName, formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'

export default class PrintReportRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber } = req.params
    const { referrer } = req.query
    const { user } = res.locals

    const adjudicationNumberValue: number = parseInt(adjudicationNumber as string, 10)
    if (Number.isNaN(adjudicationNumberValue)) {
      throw new Error('No adjudication number provided')
    }

    const adjudicationDetails = await this.reportedAdjudicationsService.getEnhancedConfirmationDetails(
      adjudicationNumberValue,
      user
    )

    return res.render(`pages/printReport`, {
      adjudicationNumber: adjudicationNumberValue,
      expirationTime: formatTimestampToTime(adjudicationDetails.reportExpirationDateTime),
      expirationDay: formatTimestampToDate(adjudicationDetails.reportExpirationDateTime, 'dddd D MMMM'),
      prisonerFirstAndLastName: formatName(adjudicationDetails.prisonerFirstName, adjudicationDetails.prisonerLastName),
      showPrisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage != null,
      prisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage,
      showPrisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages?.length > 0,
      prisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages,
      showPrisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities?.length > 0,
      prisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities,
      exitUrl: referrer,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
