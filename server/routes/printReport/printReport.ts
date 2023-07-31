import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { formatName, formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'

export default class PrintReportRoutes {
  constructor(private readonly reportedAdjudicationsService: ReportedAdjudicationsService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { chargeNumber } = req.params
    const { referrer } = req.query
    const { user } = res.locals

    const adjudicationDetails = await this.reportedAdjudicationsService.getConfirmationDetails(chargeNumber, user)
    return res.render(`pages/printReport`, {
      chargeNumber,
      expirationTime: formatTimestampToTime(adjudicationDetails.reportExpirationDateTime),
      expirationDay: formatTimestampToDate(adjudicationDetails.reportExpirationDateTime, 'dddd, D MMMM yyyy'),
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
