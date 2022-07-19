import Question from '../offenceCodeDecisions/Question'
import PlaceOnReportService from './placeOnReportService'
import UserService from './userService'
import { User } from '../data/hmppsAuthClient'
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
    private readonly decisionTree: Question
  ) {}

  getDecisionTree(): Question {
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
    allOffenceData: OffenceDetails[],
    prisoner: PrisonerResult,
    associatedPrisoner: PrisonerResult,
    incidentRole: IncidentRole,
    user: User,
    isForPdf: boolean
  ): Promise<IncidentAndOffences[]> {
    return Promise.all(
      allOffenceData?.map(async offenceData => {
        const incidentRoleEnum = incidentRoleFromCode(incidentRole.roleCode)
        const answerData = await this.answerDataDetails(offenceData, user)
        const offenceCode = Number(offenceData.offenceCode)
        const placeHolderValues = getPlaceholderValues(prisoner, associatedPrisoner, answerData)
        const questionsAndAnswers = this.questionsAndAnswers(offenceCode, placeHolderValues, incidentRoleEnum, isForPdf)
        return {
          questionsAndAnswers,
          incidentRule: incidentRole.offenceRule,
          offenceRule: offenceData.offenceRule || {
            paragraphNumber: '',
            paragraphDescription: '',
          },
        }
      })
    )
  }

  async answerDataDetails(answerData: AnswerData, user: User): Promise<AnswerDataDetails> {
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

  questionsAndAnswers(
    offenceCode: number,
    placeHolderValues: PlaceholderValues,
    incidentRole: IncidentRoleEnum,
    isForPdf: boolean
  ) {
    return this.getDecisionTree()
      .findAnswerByCode(offenceCode)
      .getProcessedQuestionsAndAnswersToGetHere(placeHolderValues, incidentRole, isForPdf)
  }
}
