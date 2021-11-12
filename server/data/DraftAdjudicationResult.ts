export type IncidentDetails = {
  locationId: number
  dateTimeOfIncident: string
  createdByUserId?: string
  createdDateTime?: string
  modifiedByUserId?: string
  modifiedByDateTime?: string
}

export type IncidentStatement = {
  statement: string
  completed?: boolean
}

export type DraftAdjudication = {
  id: number
  prisonerNumber: string
  createdByUserId: string
  createdDateTime: string
  incidentDetails: IncidentDetails
  incidentStatement?: IncidentStatement
}

export type DraftAdjudicationResult = {
  draftAdjudication: DraftAdjudication
}

export type CheckYourAnswers = {
  incidentDetails: SummarySectionItems[]
  statement: string
}

type SummarySectionItems = {
  label: string
  value: string
}

export type EditedIncidentDetails = {
  dateTimeOfIncident: string
  locationId: number
}
