import config from '../config'
import {
  DraftAdjudicationResult,
  DraftAdjudicationResultList,
  IncidentStatement,
  IncidentDetails,
  EditedIncidentDetails,
} from './DraftAdjudicationResult'
import { ReportedAdjudicationResult, ReportedAdjudication } from './ReportedAdjudicationResult'
import RestClient from './restClient'
import { User } from './hmppsAuthClient'
import { CompletedAdjudicationSummary } from './CompletedAdjudicationsData'
import { PageResponse, pageResponseFrom } from '../utils/pageResponse'
import PageRequest from '../utils/pageRequest'
import { generateRange } from '../utils/utils'

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

  async getAllDraftAdjudicationsForUser(): Promise<DraftAdjudicationResultList> {
    return this.restClient.get({
      path: `/draft-adjudications`,
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
    user: User,
    pageRequest: PageRequest
  ): Promise<PageResponse<CompletedAdjudicationSummary>> {
    return pageResponseFrom(pageRequest, dummyResults)
  }
}

const dummyResults: CompletedAdjudicationSummary[] = generateRange(1, 1, _ => {
  return {
    dateTimeOfIncident: new Date(),
    prisonerDisplayName: 'Smith, John',
    prisonerFriendlyName: 'Smith, John',
    prisonerFirstName: 'John',
    prisonerLastName: 'Smith',
    prisonerNumber: 'A1234AA',
    adjudicationsNumber: `${_}`,
  }
})
