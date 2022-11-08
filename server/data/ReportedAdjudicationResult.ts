import moment from 'moment'
import { ReviewStatus } from '../routes/prisonerReport/prisonerReportReviewValidation'
import {
  DamageDetails,
  EvidenceDetails,
  HearingDetails,
  IncidentDetails,
  IncidentRole,
  IncidentStatement,
  OffenceDetails,
  WitnessDetails,
} from './DraftAdjudicationResult'

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
  isYouthOffender: boolean
  reviewedByUserId?: string
  statusReason?: string
  statusDetails?: string
  damages?: DamageDetails[]
  evidence?: EvidenceDetails[]
  witnesses?: WitnessDetails[]
  hearings?: HearingDetails[]
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
  statusDisplayName: string
}

export type ReportedAdjudicationFilter = {
  fromDate: moment.Moment
  toDate: moment.Moment
  status?: ReportedAdjudicationStatus
}

export type ReviewAdjudication = {
  status: ReviewStatus
  statusReason: string
  statusDetails: string
}

// This enum needs to be kept in sync with the enum in the API.
export enum ReportedAdjudicationStatus {
  AWAITING_REVIEW = 'AWAITING_REVIEW',
  RETURNED = 'RETURNED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  SCHEDULED = 'SCHEDULED',
  UNSCHEDULED = 'UNSCHEDULED',
}

export function reportedAdjudicationStatusDisplayName(status: ReportedAdjudicationStatus) {
  switch (status) {
    case ReportedAdjudicationStatus.AWAITING_REVIEW:
      return 'Awaiting review'
    case ReportedAdjudicationStatus.RETURNED:
      return 'Returned'
    case ReportedAdjudicationStatus.REJECTED:
      return 'Rejected'
    case ReportedAdjudicationStatus.ACCEPTED:
      return 'Accepted'
    case ReportedAdjudicationStatus.UNSCHEDULED:
      return 'Unscheduled'
    case ReportedAdjudicationStatus.SCHEDULED:
      return 'Scheduled'
    default:
      return null
  }
}

export const reportedAdjudicationStatuses = Object.keys(ReportedAdjudicationStatus).map(key => {
  return {
    value: key,
    text: reportedAdjudicationStatusDisplayName(key as ReportedAdjudicationStatus),
  }
})
