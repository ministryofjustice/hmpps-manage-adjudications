import { IncidentDetails, IncidentStatement } from './DraftAdjudicationResult'

export type ReportedAdjudication = {
  adjudicationNumber: number
  prisonerNumber: string
  incidentDetails: IncidentDetails
  incidentStatement: IncidentStatement
}

export type ReportedAdjudicationResult = {
  reportedAdjudication: ReportedAdjudication
}
