import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { convertToTitleCase, formatName, formatTimestampToDate, formatTimestampToTime } from '../../utils/utils'
import LocationService from '../../services/locationService'

export default class ConfirmedOnReportRoutes {
  constructor(
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
    private locationService: LocationService
  ) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber } = req.params
    const { user } = res.locals

    const adjudicationNumberValue: number = parseInt(adjudicationNumber as string, 10)
    if (Number.isNaN(adjudicationNumberValue)) {
      throw new Error('No adjudication number provided')
    }

    const adjudicationDetails = await this.reportedAdjudicationsService.getReportedAdjudication(
      adjudicationNumberValue,
      user
    )

    const location = await this.locationService.getIncidentLocation('27187', user)
    const agency = await this.locationService.getAgency(location.agencyId, user)

    return res.render(`pages/confirmedOnReport`, {
      adjudicationNumber: adjudicationNumberValue,
      expirationTime: formatTimestampToTime(adjudicationDetails.reportExpirationDateTime),
      expirationDay: formatTimestampToDate(adjudicationDetails.reportExpirationDateTime, 'D MMMM YYYY'),
      prisonerFirstAndLastName: formatName(adjudicationDetails.prisonerFirstName, adjudicationDetails.prisonerLastName),
      showPrisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage != null,
      prisonerPreferredLanguage: adjudicationDetails.prisonerPreferredNonEnglishLanguage,
      showPrisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages?.length > 0,
      prisonerOtherLanguages: adjudicationDetails.prisonerOtherLanguages,
      showPrisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities?.length > 0,
      prisonerNeurodiversities: adjudicationDetails.prisonerNeurodiversities,
      statement: adjudicationDetails.statement,
      prisonerDisplayName: convertToTitleCase(
        `${adjudicationDetails.prisonerFirstName}, ${adjudicationDetails.prisonerLastName}`
      ),
      prisonerNumber: adjudicationDetails.prisonerNumber,
      locationDisplayName: location,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
