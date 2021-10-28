import config from '../config'
import DraftIncidentStatement from './IncidentStatementResult'
import RestClient from './restClient'

export interface IncidentStatement {
  statement: string
}

export default class ManageAdjudicationsClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Manage Adjudications API', config.apis.adjudications, token)
  }

  async postDraftIncidentStatement(id: number, incidentStatement: IncidentStatement): Promise<DraftIncidentStatement> {
    return this.restClient.post({
      path: `/draft-adjudications/${id}/incident-statement`,
      data: { ...incidentStatement },
    })
  }
}
