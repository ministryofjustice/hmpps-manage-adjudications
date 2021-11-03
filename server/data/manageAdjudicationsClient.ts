import config from '../config'
import { DraftAdjudicationResult, IncidentStatement, IncidentDetails } from './DraftAdjudicationResult'
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
}
