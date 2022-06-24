export type IncidentDetails = {
  locationId: number
  dateTimeOfIncident: string
  handoverDeadline?: string
}

export type IncidentRole = {
  roleCode?: string
  associatedPrisonersNumber?: string
  offenceRule?: OffenceRule
}

export type IncidentStatement = {
  statement: string
  completed?: boolean
}

export type OffenceRule = {
  paragraphDescription: string
  paragraphNumber: string
}

export type OffenceDetails = {
  offenceCode: number
  offenceRule?: OffenceRule
  victimOtherPersonsName?: string
  victimPrisonersNumber?: string
  victimStaffUsername?: string
}

export type DraftAdjudication = {
  id: number
  adjudicationNumber?: number
  prisonerNumber: string
  startedByUserId: string
  incidentDetails: IncidentDetails
  incidentRole?: IncidentRole
  incidentStatement?: IncidentStatement
  offenceDetails?: OffenceDetails[]
  isYouthOffender?: boolean
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
  isYouthOffender: boolean
}

type SummarySectionItems = {
  label: string
  value: string
}

export type EditedIncidentDetails = {
  dateTimeOfIncident: string
  locationId: number
  incidentRole?: IncidentRole
  removeExistingOffences?: boolean
}

export type EditIncidentRoleRequest = {
  incidentRole?: IncidentRole
  removeExistingOffences?: boolean
}

export type TaskListDetails = {
  handoverDeadline: string
  statementPresent: boolean
  statementComplete: boolean
  offenceDetailsComplete: boolean
}

export type PrisonerReport = CheckYourAnswers

export type ApplicableRules = {
  isYouthOffenderRule: boolean
  removeExistingOffences: boolean
}
