import { plainToClassFromExist } from 'class-transformer'
import config from '../config'
import {
  DraftAdjudicationResult,
  IncidentStatement,
  IncidentDetails,
  EditedIncidentDetails,
} from './DraftAdjudicationResult'
import { ReportedAdjudicationResult, ReportedAdjudication } from './ReportedAdjudicationResult'
import RestClient from './restClient'
import { PageResponse } from '../utils/pageResponse'
import PageRequest from '../utils/pageRequest'

export interface IncidentDetailsEnhanced extends IncidentDetails {
  prisonerNumber: string
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

  async getCompletedAdjudications(
    agencyId: string,
    pageRequest: PageRequest
  ): Promise<PageResponse<ReportedAdjudication>> {
    const result = await this.restClient.get({
      path: `/reported-adjudications/my/agency/${agencyId}/?page=0&size=10`,
    })
    return plainToClassFromExist(new PageResponse<ReportedAdjudication>(0, 0, 0, null, 0), result)
  }
}
