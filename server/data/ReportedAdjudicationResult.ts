import { IncidentDetails, IncidentRole, IncidentStatement, OffenceDetails } from './DraftAdjudicationResult'

export type ReportedAdjudication = {
  adjudicationNumber: number
  prisonerNumber: string
  bookingId: number
  createdDateTime: string
  createdByUserId: string
  incidentDetails: IncidentDetails
  incidentStatement: IncidentStatement
  incidentRole: IncidentRole
  offenceDetails: OffenceDetails[]
}

export type ReportedAdjudicationResult = {
  reportedAdjudication: ReportedAdjudication
}

export interface ReportedAdjudicationEnhanced extends ReportedAdjudication {
  displayName: string
  friendlyName: string
  formattedDateTimeOfIncident: string
  dateTimeOfIncident: string
  reportingOfficer?: string
  prisonerReportUrl?: string
}
