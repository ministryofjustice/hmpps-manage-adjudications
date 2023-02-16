import config from '../config'
import {
  DraftAdjudicationResult,
  IncidentStatement,
  IncidentDetails,
  EditedIncidentDetails,
  EditIncidentRoleRequest,
  OffenceRule,
  OffenceDetails,
  ApplicableRules,
  AssociatedPrisoner,
  DamageDetails,
  EvidenceDetails,
  WitnessDetails,
  PrisonerGender,
  DraftAdjudication,
} from './DraftAdjudicationResult'
import {
  ReportedAdjudicationResult,
  ReportedAdjudication,
  ReportedAdjudicationFilter,
  ReviewAdjudication,
  ScheduledHearingList,
  allStatuses,
  ReportedAdjudicationDISFormFilter,
  ReportedAdjudicationsResult,
  allIssueStatuses,
} from './ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from './ApiData'
import RestClient from './restClient'
import { momentDateToApi } from '../utils/utils'
import { ContinueReportApiFilter } from '../routes/continueReport/continueReportFilterHelper'
import { HearingDetails, HearingOutcomeDetails } from './HearingAndOutcomeResult'

export interface IncidentDetailsEnhanced extends IncidentDetails {
  prisonerNumber: string
  agencyId: string
  gender: PrisonerGender
}

export default class ManageAdjudicationsClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Manage Adjudications API', config.apis.adjudications, token)
  }

  async startNewDraftAdjudication(incidentDetails: IncidentDetailsEnhanced): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/draft-adjudications`,
      data: { ...incidentDetails },
    })
  }

  async postDraftIncidentStatement(id: number, incidentStatement: IncidentStatement): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/draft-adjudications/${id}/incident-statement`,
      data: { ...incidentStatement },
    })
  }

  async putDraftIncidentStatement(id: number, incidentStatement: IncidentStatement): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${id}/incident-statement`,
      data: { ...incidentStatement },
    })
  }

  async getDraftAdjudication(id: number): Promise<DraftAdjudicationResult> {
    return this.restClient.get({
      path: `/draft-adjudications/${id}`,
    })
  }

  async getAllDraftAdjudicationsForUser(
    agencyId: string,
    filter: ContinueReportApiFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<DraftAdjudication>> {
    const path =
      `/draft-adjudications/my/agency/${agencyId}?page=${pageRequest.number}&size=${pageRequest.size}` +
      `${(filter.fromDate && `&startDate=${momentDateToApi(filter.fromDate)}`) || ''}` +
      `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}`

    return this.restClient.get({
      path,
    })
  }

  async submitCompleteDraftAdjudication(id: number): Promise<ReportedAdjudication> {
    return this.restClient.post({
      path: `/draft-adjudications/${id}/complete-draft-adjudication`,
    })
  }

  async editDraftIncidentDetails(
    id: number,
    editedIncidentDetails: EditedIncidentDetails
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${id}/incident-details`,
      data: { ...editedIncidentDetails },
    })
  }

  async updateIncidentRole(
    id: number,
    editIncidentRoleRequest: EditIncidentRoleRequest
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${id}/incident-role`,
      data: { ...editIncidentRoleRequest },
    })
  }

  async getReportedAdjudication(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.get({
      path: `/reported-adjudications/${adjudicationNumber}`,
    })
  }

  async updateAdjudicationStatus(
    adjudicationNumber: number,
    payload: ReviewAdjudication
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/status`,
      data: payload,
    })
  }

  private getCompletedAdjudications =
    (prefix: string) =>
    async (
      agencyId: string,
      filter: ReportedAdjudicationFilter,
      pageRequest: ApiPageRequest
    ): Promise<ApiPageResponse<ReportedAdjudication>> => {
      const path =
        `${prefix}agency/${agencyId}?page=${pageRequest.number}&size=${pageRequest.size}` +
        `${(filter.fromDate && `&startDate=${momentDateToApi(filter.fromDate)}`) || ''}` +
        `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}` +
        `${(filter.status && `&status=${filter.status}`) || `&status=${allStatuses}`}`

      return this.restClient.get({
        path,
      })
    }

  getAllCompletedAdjudications = this.getCompletedAdjudications('/reported-adjudications/')

  getYourCompletedAdjudications = this.getCompletedAdjudications('/reported-adjudications/my/')

  async getReportedAdjudicationIssueData(
    agencyId: string,
    filter: ReportedAdjudicationDISFormFilter
  ): Promise<ReportedAdjudicationsResult> {
    const path =
      `/reported-adjudications/agency/${agencyId}/issue?` +
      `${(filter.fromDate && `startDate=${momentDateToApi(filter.fromDate)}`) || ''}` +
      `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}`
    return this.restClient.get({
      path,
    })
  }

  async getReportedAdjudicationPrintData(
    agencyId: string,
    filter: ReportedAdjudicationDISFormFilter
  ): Promise<ReportedAdjudicationsResult> {
    const path =
      `/reported-adjudications/agency/${agencyId}/print?${
        (filter.fromDate && `startDate=${momentDateToApi(filter.fromDate)}`) || ''
      }` +
      `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}` +
      `${(filter.issueStatus && `&issueStatus=${filter.issueStatus}`) || `&issueStatus=${allIssueStatuses}`}`
    return this.restClient.get({
      path,
    })
  }

  async createDraftFromCompleteAdjudication(adjudicationNumber: number): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/create-draft-adjudication`,
    })
  }

  async getOffenceRule(offenceCode: number, isYouthOffender: boolean, gender: PrisonerGender): Promise<OffenceRule> {
    return this.restClient.get({
      path: `/draft-adjudications/offence-rule/${offenceCode}?youthOffender=${isYouthOffender}&gender=${gender}`,
    })
  }

  async saveOffenceDetails(adjudicationNumber: number, offenceDetails: OffenceDetails) {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/offence-details`,
      data: { offenceDetails },
    })
  }

  async saveYouthOffenderStatus(
    adjudicationNumber: number,
    applicableRulesData: ApplicableRules
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/applicable-rules`,
      data: applicableRulesData,
    })
  }

  async saveAssociatedPrisoner(
    adjudicationNumber: number,
    associatedPrisoner: AssociatedPrisoner
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/associated-prisoner`,
      data: associatedPrisoner,
    })
  }

  async saveDamageDetails(adjudicationNumber: number, damages: DamageDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/damages`,
      data: { damages },
    })
  }

  async updateDamageDetails(adjudicationNumber: number, damages: DamageDetails[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/damages/edit`,
      data: { damages },
    })
  }

  async saveEvidenceDetails(adjudicationNumber: number, evidence: EvidenceDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/evidence`,
      data: { evidence },
    })
  }

  async updateEvidenceDetails(
    adjudicationNumber: number,
    evidence: EvidenceDetails[]
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/evidence/edit`,
      data: { evidence },
    })
  }

  async saveWitnessDetails(adjudicationNumber: number, witnesses: WitnessDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/witnesses`,
      data: { witnesses },
    })
  }

  async updateWitnessDetails(
    adjudicationNumber: number,
    witnesses: WitnessDetails[]
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/witnesses/edit`,
      data: { witnesses },
    })
  }

  async cancelHearing(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${adjudicationNumber}/hearing`,
    })
  }

  async createHearing(adjudicationNumber: number, hearingDetails: HearingDetails): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/hearing`,
      data: hearingDetails,
    })
  }

  async amendHearing(adjudicationNumber: number, hearingDetails: HearingDetails): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/hearing`,
      data: hearingDetails,
    })
  }

  async getHearingsGivenAgencyAndDate(agencyId: string, chosenHearingDate: string): Promise<ScheduledHearingList> {
    return this.restClient.get({
      path: `/reported-adjudications/hearings/agency/${agencyId}?hearingDate=${chosenHearingDate}`,
    })
  }

  async amendGender(id: number, chosenGender: { gender: PrisonerGender }): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${id}/gender`,
      data: { ...chosenGender },
    })
  }

  async putDateTimeOfIssue(adjudicationNumber: number, dateTimeOfIssue: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/issue`,
      data: { dateTimeOfIssue },
    })
  }

  async createHearingOutcome(
    adjudicationNumber: number,
    hearingOutcomeDetails: HearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/outcome`,
      data: { ...hearingOutcomeDetails },
    })
  }

  async updateHearingOutcome(
    adjudicationNumber: number,
    hearingOutcomeDetails: HearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/outcome`,
      data: { ...hearingOutcomeDetails },
    })
  }
}
