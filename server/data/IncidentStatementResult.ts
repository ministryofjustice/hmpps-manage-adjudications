import { Expose } from 'class-transformer'

type IncidentDetails = {
  locationId: number
  dateTimeOfIncident: string
}

type IncidentStatement = {
  statement: number
}

type DraftIncidentStatement = {
  id: number
  prisonerNumber: string
  adjudicationSent: boolean
  incidentDetails: IncidentDetails
  incidentStatement: IncidentStatement
}

export default class DraftIncidentStatementResult {
  @Expose()
  draftAdjudication: DraftIncidentStatement
}
