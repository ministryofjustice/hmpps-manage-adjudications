export type IncidentDetails = {
  locationId: number
  dateTimeOfIncident: string
}

export type IncidentStatement = {
  statement: string
}

export type DraftAdjudication = {
  id: number
  prisonerNumber: string
  incidentDetails: IncidentDetails
  incidentStatement?: IncidentStatement
}

export type DraftAdjudicationResult = {
  draftAdjudication: DraftAdjudication
}
