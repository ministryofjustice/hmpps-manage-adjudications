import Question from '../offenceCodeDecisions/Question'
import PlaceOnReportService, { PrisonerResultSummary } from './placeOnReportService'
import UserService from './userService'
import { User } from '../data/hmppsManageUsersClient'
import { IncidentRole as IncidentRoleEnum, incidentRoleFromCode } from '../incidentRole/IncidentRole'
import { AnswerDataDetails, PlaceholderValues, getPlaceholderValues } from '../offenceCodeDecisions/Placeholder'
import PrisonerResult from '../data/prisonerResult'
import { DraftAdjudication, IncidentRole, OffenceDetails, OffenceRule } from '../data/DraftAdjudicationResult'
import ReportedAdjudicationsService from './reportedAdjudicationsService'
import { ReportedAdjudication } from '../data/ReportedAdjudicationResult'

export type AnswerData = {
  victimOtherPersonsName?: string
  victimPrisonersNumber?: string
  victimStaffUsername?: string
}

export type IncidentAndOffences = {
  questionsAndAnswers: { question: string; answer: string }[]
  incidentRule: OffenceRule
  offenceRule: OffenceRule
}

export default class DecisionTreeService {
  constructor(
    private readonly placeOnReportService: PlaceOnReportService,
    private readonly userService: UserService,
    private readonly reportedAdjudicationService: ReportedAdjudicationsService,
    private readonly decisionTree: Question,
    private readonly additionalQuestions: Question[]
  ) {}

  getDecisionTree(key: string): Question {
    if (key === null) {
      return this.decisionTree
    }

    const additionalQuestion = this.additionalQuestions.filter(question => key.startsWith(question.id()))

    if (additionalQuestion.length === 0) {
      return this.decisionTree
    }
    return additionalQuestion[0]
  }

  async draftAdjudicationIncidentData(draftAdjudicationId: number, user: User) {
    const { draftAdjudication } = await this.placeOnReportService.getDraftAdjudicationDetails(draftAdjudicationId, user)
    const data = await this.adjudicationIncidentData(draftAdjudication, user)
    return {
      draftAdjudication,
      incidentRole: data.incidentRole,
      associatedPrisoner: data.associatedPrisoner,
      prisoner: data.prisoner,
    }
  }

  async reportedAdjudicationIncidentData(chargeNumber: string, user: User) {
    const { reportedAdjudication } = await this.reportedAdjudicationService.getReportedAdjudicationDetails(
      chargeNumber,
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

  async adjudicationIncidentData(adjudication: DraftAdjudication | ReportedAdjudication, user: User) {
    let incidentRole = null
    if (adjudication.incidentRole) {
      incidentRole = incidentRoleFromCode(adjudication.incidentRole.roleCode)
    }
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
    offenceData: OffenceDetails,
    prisoner: PrisonerResult,
    associatedPrisoner: PrisonerResult,
    incidentRole: IncidentRole,
    user: User,
    prisonerView: boolean
  ): Promise<IncidentAndOffences> {
    if (offenceData.offenceCode === 0) {
      return {
        questionsAndAnswers: [],
        incidentRule: null,
        offenceRule: {
          paragraphNumber: offenceData.offenceRule?.paragraphNumber.split(':').pop(),
          paragraphDescription: offenceData.offenceRule?.paragraphDescription,
        },
      }
    }
    const incidentRoleEnum = incidentRoleFromCode(incidentRole.roleCode)
    const answerData = await this.answerDataDetails(offenceData, user)
    const offenceCode = Number(offenceData.offenceCode)
    const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
    const questionsAndAnswers = this.questionsAndAnswers(offenceCode, placeHolderValues, incidentRoleEnum, prisonerView)
    return {
      questionsAndAnswers,
      incidentRule: incidentRole.offenceRule,
      offenceRule: offenceData.offenceRule || {
        paragraphNumber: '',
        paragraphDescription: '',
      },
    }
  }

  async answerDataDetails(answerData: AnswerData, user: User): Promise<AnswerDataDetails> {
    const [victimOtherPerson, victimPrisoner, victimStaff] = await Promise.all([
      answerData.victimOtherPersonsName,
      this.getPrisonerDetails(answerData, user),
      answerData.victimStaffUsername &&
        answerData.victimStaffUsername !== 'undefined' &&
        this.userService.getStaffFromUsername(answerData.victimStaffUsername, user),
    ])
    return {
      victimOtherPerson,
      victimPrisoner,
      victimStaff,
      victimPrisonerNumber: answerData.victimPrisonersNumber,
    }
  }

  private async getPrisonerDetails(answerData: AnswerData, user: User): Promise<PrisonerResultSummary> {
    // The victimOtherPersonsName will be set if the prisoner is from outside the establishment,
    // in which case we do not want to get the extra prisoner information
    if (!answerData.victimPrisonersNumber || answerData.victimOtherPersonsName) {
      return undefined
    }
    return this.placeOnReportService.getPrisonerDetails(answerData.victimPrisonersNumber, user)
  }

  questionsAndAnswers(
    offenceCode: number,
    placeHolderValues: PlaceholderValues,
    incidentRole: IncidentRoleEnum,
    prisonerView: boolean
  ) {
    return this.getDecisionTree(null)
      .findAnswerByCode(offenceCode)
      .getProcessedQuestionsAndAnswersToGetHere(placeHolderValues, incidentRole, prisonerView)
  }
}
