import config from '../config'
import {
  DraftAdjudicationResult,
  DraftAdjudicationResultList,
  IncidentStatement,
  IncidentDetails,
  EditedIncidentDetails,
  IncidentRole,
  OffenceRule,
  OffenceDetails,
} from './DraftAdjudicationResult'
import {
  ReportedAdjudicationResult,
  ReportedAdjudication,
  ReportedAdjudicationFilter,
} from './ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from './ApiData'
import RestClient from './restClient'
import { momentDateToApi } from '../utils/utils'

export interface IncidentDetailsEnhanced extends IncidentDetails {
  prisonerNumber: string
  agencyId: string
  incidentRole: IncidentRole
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

  async getReportedAdjudication(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.get({
      path: `/reported-adjudications/${adjudicationNumber}`,
    })
  }

  async getYourCompletedAdjudications(
    agencyId: string,
    filter: ReportedAdjudicationFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<ReportedAdjudication>> {
    let path = `/reported-adjudications/my/agency/${agencyId}?page=${pageRequest.number}&size=${pageRequest.size}`
    path += (filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''
    path += (filter.fromDate && `&startDate=${momentDateToApi(filter.fromDate)}`) || ''
    path += (filter.status && `&status=${filter.status}`) || ''
    return this.restClient.get({
      path,
    })
  }

  async getAllCompletedAdjudications(
    agencyId: string,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<ReportedAdjudication>> {
    return this.restClient.get({
      path: `/reported-adjudications/agency/${agencyId}?page=${pageRequest.number}&size=${pageRequest.size}`,
    })
  }

  async createDraftFromCompleteAdjudication(adjudicationNumber: number): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/create-draft-adjudication`,
    })
  }

  async getOffenceRule(offenceCode: number): Promise<OffenceRule> {
    return this.restClient.get({
      path: `/draft-adjudications/offence-rule/${offenceCode}`,
    })
  }

  async saveOffenceDetails(adjudicationNumber: number, offenceDetails: OffenceDetails[]) {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/offence-details`,
      data: { offenceDetails },
    })
  }
}
