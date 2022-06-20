import config from '../config'
import {
  DraftAdjudicationResult,
  DraftAdjudicationResultList,
  IncidentStatement,
  IncidentDetails,
  EditedIncidentDetails,
  EditIncidentRoleRequest,
  OffenceRule,
  OffenceDetails,
  isYouthOffenderRule,
} from './DraftAdjudicationResult'
import {
  ReportedAdjudicationResult,
  ReportedAdjudication,
  ReportedAdjudicationFilter,
  ReviewAdjudication,
} from './ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from './ApiData'
import RestClient from './restClient'
import { momentDateToApi } from '../utils/utils'

export interface IncidentDetailsEnhanced extends IncidentDetails {
  prisonerNumber: string
  agencyId: string
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

  async getAllDraftAdjudicationsForUser(agencyId: string): Promise<DraftAdjudicationResultList> {
    return this.restClient.get({
      path: `/draft-adjudications/my/agency/${agencyId}`,
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
        `${(filter.status && `&status=${filter.status}`) || ''}`
      return this.restClient.get({
        path,
      })
    }

  getAllCompletedAdjudications = this.getCompletedAdjudications('/reported-adjudications/')

  getYourCompletedAdjudications = this.getCompletedAdjudications('/reported-adjudications/my/')

  async createDraftFromCompleteAdjudication(adjudicationNumber: number): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/create-draft-adjudication`,
    })
  }

  async getOffenceRule(offenceCode: number, isYouthOffender: boolean): Promise<OffenceRule> {
    return this.restClient.get({
      path: `/draft-adjudications/offence-rule/${offenceCode}?youthOffender=${isYouthOffender}`,
    })
  }

  async saveOffenceDetails(adjudicationNumber: number, offenceDetails: OffenceDetails[]) {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/offence-details`,
      data: { offenceDetails },
    })
  }

  async saveYouthOffenderStatus(
    adjudicationNumber: number,
    isYOI: isYouthOffenderRule
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/applicable-rules`,
      data: isYOI,
    })
  }
}
