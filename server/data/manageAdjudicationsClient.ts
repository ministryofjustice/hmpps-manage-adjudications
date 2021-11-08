import config from '../config'
import { DraftAdjudicationResult, IncidentStatement, IncidentDetails } from './DraftAdjudicationResult'
import { ReportedAdjudicationResult } from './ReportedAdjudicationResult'
import RestClient from './restClient'
import { User } from './hmppsAuthClient'
import { CompletedAdjudicationSummary } from './CompletedAdjudicationsData'
import { PageRequest, PageResponse, pageResponseFrom } from '../utils/Pagination'

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

const dummyResults: CompletedAdjudicationSummary[] = [
  {
    dateTimeOfIncident: new Date(),
    prisonerDisplayName: 'Smith, John',
    prisonerFriendlyName: 'Smith, John',
    prisonerFirstName: 'John',
    prisonerLastName: 'Smith',
    prisonerNumber: 'A1234AA',
    adjudicationsNumber: '1',
  },
]
