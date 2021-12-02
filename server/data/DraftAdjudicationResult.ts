export type IncidentDetails = {
  locationId: number
  dateTimeOfIncident: string
  handoverDeadline?: string
  createdByUserId?: string
  createdDateTime?: string
  modifiedByUserId?: string
  modifiedByDateTime?: string
}

export type IncidentStatement = {
  statement: string
  completed?: boolean
  createdByUserId?: string
  createdDateTime?: string
  modifiedByDateTime?: string
  modifiedByUserId?: string
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

export type DraftAdjudicationResultList = {
  draftAdjudications: DraftAdjudication[]
}

export type CheckYourAnswers = {
  incidentDetails: SummarySectionItems[]
  statement: string
}

export interface PrisonerReport extends CheckYourAnswers {
  reportNo: number
  draftId: number
}

type SummarySectionItems = {
  label: string
  value: string
}

export type EditedIncidentDetails = {
  dateTimeOfIncident: string
  locationId: number
}

export type TaskListDetails = {
  handoverDeadline: string
  statementPresent: boolean
  statementComplete: boolean
}
