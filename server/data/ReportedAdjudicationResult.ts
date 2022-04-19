import moment from 'moment'
import { IncidentDetails, IncidentRole, IncidentStatement, OffenceDetails } from './DraftAdjudicationResult'
import { ReportedAdjudicationStatus } from './ReportedAdjudicationStatus'

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
  status: ReportedAdjudicationStatus
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
}

export type ReportedAdjudicationFilter = {
  fromDate: moment.Moment
  toDate: moment.Moment
  status?: ReportedAdjudicationStatus
}
