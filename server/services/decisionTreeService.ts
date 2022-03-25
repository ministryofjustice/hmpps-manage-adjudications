import { Decision } from '../offenceCodeDecisions/Decision'
import PlaceOnReportService from './placeOnReportService'
import UserService from './userService'
import { User } from '../data/hmppsAuthClient'
import { IncidentRole, incidentRoleFromCode } from '../incidentRole/IncidentRole'
import { OffenceData } from '../routes/offenceCodeDecisions/offenceData'
import { AnswerData, PlaceholderValues, getPlaceholderValues } from '../offenceCodeDecisions/Placeholder'
import prisonerResult from '../data/prisonerResult'
import { DraftAdjudication } from '../data/DraftAdjudicationResult'
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
      draftAdjudication: data.adjudication as DraftAdjudication,
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
      reportedAdjudication: data.adjudication as ReportedAdjudication,
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
      adjudication,
      incidentRole,
      prisoner,
      associatedPrisoner,
    }
  }

  async getAdjudicationOffences(
    allOffenceData: AllOffenceData[],
    prisoner: prisonerResult,
    associatedPrisoner: prisonerResult,
    incidentRole: IncidentRole,
    draftAdjudication: DraftAdjudication,
    user: User
  ) {
    return Promise.all(
      allOffenceData.map(async offenceData => {
        const answerData = await this.answerData(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = this.questionsAndAnswers(offenceCode, placeHolderValues, incidentRole)
        return {
          questionsAndAnswers,
          incidentRule: draftAdjudication.incidentRole.offenceRule,
          offenceRule: await this.placeOnReportService.getOffenceRule(offenceCode, user),
        }
      })
    )
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

  questionsAndAnswers(offenceCode: number, placeHolderValues: PlaceholderValues, incidentRole: IncidentRole) {
    return this.getDecisionTree()
      .findAnswerByCode(offenceCode)
      .getProcessedQuestionsAndAnswersToGetHere(placeHolderValues, incidentRole)
  }
}
