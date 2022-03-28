import { Decision } from '../offenceCodeDecisions/Decision'
import PlaceOnReportService from './placeOnReportService'
import UserService from './userService'
import { User } from '../data/hmppsAuthClient'
import { IncidentRole as IncidentRoleEnum, incidentRoleFromCode } from '../incidentRole/IncidentRole'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'
import { AnswerData, PlaceholderValues, getPlaceholderValues } from '../offenceCodeDecisions/Placeholder'
import PrisonerResult from '../data/prisonerResult'
import { DraftAdjudication, IncidentRole, OffenceDetails } from '../data/DraftAdjudicationResult'
import ReportedAdjudicationsService from './reportedAdjudicationsService'
import { ReportedAdjudication } from '../data/ReportedAdjudicationResult'

export type AllOffenceData = {
  victimOtherPersonsName?: string
  victimPrisonersNumber?: string
  victimStaffUsername?: string
  offenceCode?: string
}

export default class DecisionTreeService {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly reportedAdjudicationService: ReportedAdjudicationsService,
    private readonly decisionTree: Decision
  ) {}

  getDecisionTree(): Decision {
    return this.decisionTree
  }

  async draftAdjudicationIncidentData(adjudicationNumber: number, user: User) {
    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(adjudicationNumber, user)
    const data = await this.adjudicationIncidentData(draftAdjudication, user)
    return {
      draftAdjudication,
      incidentRole: data.incidentRole,
      associatedPrisoner: data.associatedPrisoner,
      prisoner: data.prisoner,
    }
  }

  async reportedAdjudicationIncidentData(adjudicationNumber: number, user: User) {
    const { reportedAdjudication } = await this.reportedAdjudicationService.getReportedAdjudicationDetails(
      adjudicationNumber,
      user
    )
    const data = await this.adjudicationIncidentData(reportedAdjudication, user)
    return {
      reportedAdjudication,
      incidentRole: data.incidentRole,
      associatedPrisoner: data.associatedPrisoner,
      prisoner: data.prisoner,
    }
  }

  private async adjudicationIncidentData(adjudication: DraftAdjudication | ReportedAdjudication, user: User) {
    const incidentRole = incidentRoleFromCode(adjudication.incidentRole.roleCode)
    const { prisonerNumber } = adjudication
    const associatedPrisonerNumber = adjudication?.incidentRole?.associatedPrisonersNumber
    const [prisoner, associatedPrisoner] = await Promise.all([
      this.placeOnReportService.getPrisonerDetails(prisonerNumber, user),
      associatedPrisonerNumber && this.placeOnReportService.getPrisonerDetails(associatedPrisonerNumber, user),
    ])
    return {
      incidentRole,
      prisoner,
      associatedPrisoner,
    }
  }

  async getAdjudicationOffences(
    allOffenceData: OffenceDetails[],
    prisoner: PrisonerResult,
    associatedPrisoner: PrisonerResult,
    incidentRole: IncidentRole,
    user: User
  ) {
    return Promise.all(
      allOffenceData?.map(async offenceData => {
        const incidentRoleEnum = incidentRoleFromCode(incidentRole.roleCode)
        const answerData = await this.answerData(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = this.questionsAndAnswers(offenceCode, placeHolderValues, incidentRoleEnum)
        return {
          questionsAndAnswers,
          incidentRule: incidentRole.offenceRule,
          offenceRule: await this.placeOnReportService.getOffenceRule(offenceCode, user),
        }
      })
    )
  }

  allOffences(adjudication: DraftAdjudication | ReportedAdjudication) {
    return (
      adjudication.offenceDetails?.map(offenceDetails => {
        return {
          victimOtherPersonsName: offenceDetails.victimOtherPersonsName,
          victimPrisonersNumber: offenceDetails.victimPrisonersNumber,
          victimStaffUsername: offenceDetails.victimStaffUsername,
          offenceCode: `${offenceDetails.offenceCode}`,
        }
      }) || []
    )
  }

  // TODO rename
  async answerData(
    answerData: { victimOtherPersonsName?: string; victimPrisonersNumber?: string; victimStaffUsername?: string },
    user: User
  ): Promise<AnswerData> {
    const [victimOtherPerson, victimPrisoner, victimStaff] = await Promise.all([
      answerData.victimOtherPersonsName,
      answerData.victimPrisonersNumber &&
        this.placeOnReportService.getPrisonerDetails(answerData.victimPrisonersNumber, user),
      answerData.victimStaffUsername && this.userService.getStaffFromUsername(answerData.victimStaffUsername, user),
    ])
    return {
      victimOtherPerson,
      victimPrisoner,
      victimStaff,
    }
  }

  questionsAndAnswers(offenceCode: number, placeHolderValues: PlaceholderValues, incidentRole: IncidentRoleEnum) {
    return this.getDecisionTree()
      .findAnswerByCode(offenceCode)
      .getProcessedQuestionsAndAnswersToGetHere(placeHolderValues, incidentRole)
  }
}
