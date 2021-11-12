import { IncidentDetails, IncidentStatement } from './DraftAdjudicationResult'

export type ReportedAdjudication = {
  adjudicationNumber: number
  prisonerNumber: string
  bookingId: number
  incidentDetails: IncidentDetails
  incidentStatement: IncidentStatement
}

export type ReportedAdjudicationResult = {
  reportedAdjudication: ReportedAdjudication
}
