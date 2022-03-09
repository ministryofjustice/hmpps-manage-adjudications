import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import { User } from '../../data/hmppsAuthClient'
import { IncidentRole, incidentRoleFromCode } from '../../incidentRole/IncidentRole'
import { OffenceData } from '../offenceCodeDecisions/offenceData'
import { AnswerData, PlaceholderValues } from '../../offenceCodeDecisions/Placeholder'
import AllOffencesSessionService from '../../services/allOffencesSessionService'

export default class DetailsOfOffenceHelper {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly allOffencesSessionService: AllOffencesSessionService,
    private readonly decisionTreeService: DecisionTreeService
  ) {}

  adjudicationData = async (adjudicationNumber: number, user: User) => {
    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
    const incidentRole = incidentRoleFromCode(draftAdjudication.incidentRole.roleCode)
    const { prisoner, associatedPrisoner } = await this.placeOnReportService.getOffencePrisonerDetails(
      adjudicationNumber,
      user
    )
    return {
      adjudicationNumber,
      draftAdjudication,
      incidentRole,
      prisoner,
      associatedPrisoner,
    }
  }

  answerData = async (data: OffenceData, user: User): Promise<AnswerData> => {
    const [victimOtherPerson, victimPrisoner, victimStaff] = await Promise.all([
      data.victimOtherPersonsName,
      data.victimPrisonersNumber && this.placeOnReportService.getPrisonerDetails(data.victimPrisonersNumber, user),
      data.victimStaffUsername && this.userService.getStaffFromUsername(data.victimStaffUsername, user),
    ])
    return {
      victimOtherPerson,
      victimPrisoner,
      victimStaff,
    }
  }

  questionsAndAnswers = (offenceCode: number, placeHolderValues: PlaceholderValues, incidentRole: IncidentRole) => {
    return this.decisions()
      .findAnswerByCode(offenceCode)
      .getProcessedQuestionsAndAnswersToGetHere(placeHolderValues, incidentRole)
  }

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

  private decisions() {
    return this.decisionTreeService.getDecisionTree()
  }
}
