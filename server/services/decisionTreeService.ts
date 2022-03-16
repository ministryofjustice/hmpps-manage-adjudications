import decisionTree from '../offenceCodeDecisions/DecisionTree'
import { Decision } from '../offenceCodeDecisions/Decision'
import PlaceOnReportService from './placeOnReportService'
import UserService from './userService'
import { User } from '../data/hmppsAuthClient'
import { IncidentRole, incidentRoleFromCode } from '../incidentRole/IncidentRole'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'
import { AnswerData, PlaceholderValues } from '../offenceCodeDecisions/Placeholder'
import { DraftAdjudication } from '../data/DraftAdjudicationResult'
import PrisonerResult from '../data/prisonerResult'

export type AdjudicationData = {
  adjudicationNumber: number
  draftAdjudication: DraftAdjudication
  incidentRole: IncidentRole
  prisoner: PrisonerResult
  associatedPrisoner: PrisonerResult
}

export default class DecisionTreeService {
  constructor(private readonly placeOnReportService: PlaceOnReportService, private readonly userService: UserService) {}

  getDecisionTree(): Decision {
    return decisionTree
  }

  async adjudicationData(adjudicationNumber: number, user: User): Promise<AdjudicationData> {
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

  async allOffences(adjudicationNumber: number, user: User) {
    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
    return (
      draftAdjudication.offenceDetails?.map(offenceDetails => {
        return {
          victimOtherPersonsName: offenceDetails.victimOtherPersonsName,
          victimPrisonersNumber: offenceDetails.victimPrisonersNumber,
          victimStaffUsername: offenceDetails.victimStaffUsername,
          offenceCode: `${offenceDetails.offenceCode}`,
        }
      }) || []
    )
  }

  async answerData(data: OffenceData, user: User): Promise<AnswerData> {
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

  async questionsAndAnswers(offenceCode: number, placeHolderValues: PlaceholderValues, incidentRole: IncidentRole) {
    return this.getDecisionTree()
      .findAnswerByCode(offenceCode)
      .getProcessedQuestionsAndAnswersToGetHere(placeHolderValues, incidentRole)
  }
}
