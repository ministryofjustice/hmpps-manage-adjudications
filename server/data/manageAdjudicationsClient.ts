import config from '../config'
import { DraftAdjudicationResult, IncidentStatement, IncidentDetails } from './DraftAdjudicationResult'
import { ReportedAdjudicationResult, ReportedAdjudication } from './ReportedAdjudicationResult'
import RestClient from './restClient'

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

  async getReportedAdjudication(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.get({
      path: `/reported-adjudications/${adjudicationNumber}`,
    })
  }
}
