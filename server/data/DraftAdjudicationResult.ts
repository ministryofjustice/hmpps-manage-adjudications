export type IncidentDetails = {
  locationId: number
  dateTimeOfIncident: string
  handoverDeadline?: string
}

export type IncidentRole = {
  roleCode?: string
  associatedPrisonersNumber?: string
}

export type IncidentStatement = {
  statement: string
  completed?: boolean
}

export type DraftAdjudication = {
  id: number
  adjudicationNumber?: number
  prisonerNumber: string
  startedByUserId: string
  incidentDetails: IncidentDetails
  incidentRole: IncidentRole
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
  adjudicationNumber?: number
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
  incidentRole?: IncidentRole
}

export type TaskListDetails = {
  handoverDeadline: string
  statementPresent: boolean
  statementComplete: boolean
}
