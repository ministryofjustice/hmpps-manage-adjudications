import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'

export default class DetailsOfOffenceHelper {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly allOffencesSessionService: AllOffencesSessionService
  ) {}

  populateSessionIfEmpty = async (adjudicationNumber: number, req: Request, res: Response) => {
    const { user } = res.locals
    const allOffencesOnSession = this.allOffencesSessionService.getAllSessionOffences(req, adjudicationNumber)
    if (allOffencesOnSession) {
      return allOffencesOnSession // We already have something on the session, so we return.
    }
    // If we do not have anything on the session, we go to the api to populate it.
    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
    const allOffenceData =
      draftAdjudication.offenceDetails?.map(offenceDetails => {
        return {
          victimOtherPersonsName: offenceDetails.victimOtherPersonsName,
          victimPrisonersNumber: offenceDetails.victimPrisonersNumber,
          victimStaffUsername: offenceDetails.victimStaffUsername,
          offenceCode: `${offenceDetails.offenceCode}`,
        }
      }) || []
    this.allOffencesSessionService.setAllSessionOffences(req, allOffenceData, adjudicationNumber)
    return allOffenceData
  }
}
