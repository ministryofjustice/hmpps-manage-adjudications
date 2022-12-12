import moment from 'moment'
import { ReviewStatus } from '../routes/adjudicationTabbedParent/prisonerReport/prisonerReportReviewValidation'
import {
  DamageDetails,
  EvidenceDetails,
  HearingDetails,
  IncidentDetails,
  IncidentRole,
  IncidentStatement,
  OffenceDetails,
  PrisonerGender,
  WitnessDetails,
} from './DraftAdjudicationResult'
import { LocationId } from './PrisonLocationResult'

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
  gender: PrisonerGender
  issuingOfficer?: string
  dateTimeOfIssue?: string
}

export type ReportedAdjudicationResult = {
  reportedAdjudication: ReportedAdjudication
}

export type ReportedAdjudicationsResult = {
  reportedAdjudications: ReportedAdjudication[]
}

export interface ReportedAdjudicationEnhanced extends ReportedAdjudication {
  displayName: string
  friendlyName: string
  dateTimeOfIncident: string
  dateTimeOfDiscovery: string
  formattedDateTimeOfIncident: string
  formattedDateTimeOfDiscovery: string
  reportingOfficer?: string
  statusDisplayName: string
  formattedDateTimeOfScheduledHearing: string
}

export interface ReportedAdjudicationEnhancedWithIssuingDetails extends ReportedAdjudication {
  displayName: string
  friendlyName: string
  issuingOfficer: string
  prisonerLocation: string
  formattedDateTimeOfDiscovery: string
  dateTimeOfDiscovery: string
  formattedDateTimeOfIssue: string
  formsAlreadyIssued: boolean
}

export type ReportedAdjudicationFilter = {
  fromDate: moment.Moment
  toDate: moment.Moment
  status: ReportedAdjudicationStatus | ReportedAdjudicationStatus[]
}

export type ReportedAdjudicationDISFormFilter = {
  fromDate: moment.Moment
  toDate: moment.Moment
  locationId: LocationId
}

export type ScheduledHearingFilter = {
  hearingDate: string
}

export type ScheduledHearingList = {
  hearings: ScheduledHearing[]
}

export interface ScheduledHearing {
  id: number
  dateTimeOfHearing: string
  dateTimeOfDiscovery: string
  adjudicationNumber: number
  prisonerNumber: string
  oicHearingType: OicHearingType
}

export interface ScheduledHearingEnhanced extends ScheduledHearing {
  friendlyName: string
  nameAndNumber: string
  formattedDateTimeOfHearing: string
  formattedDateTimeOfDiscovery: string
}

export type ReviewAdjudication = {
  status: ReviewStatus
  statusReason: string
  statusDetails: string
}

// This enum needs to be kept in sync with the enum in the API.
export enum ReportedAdjudicationStatus {
  AWAITING_REVIEW = 'AWAITING_REVIEW',
  UNSCHEDULED = 'UNSCHEDULED',
  RETURNED = 'RETURNED',
  SCHEDULED = 'SCHEDULED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

export const allStatuses = [
  ReportedAdjudicationStatus.SCHEDULED,
  ReportedAdjudicationStatus.UNSCHEDULED,
  ReportedAdjudicationStatus.AWAITING_REVIEW,
  ReportedAdjudicationStatus.RETURNED,
  ReportedAdjudicationStatus.REJECTED,
]

export enum OicHearingType {
  GOV_ADULT = 'GOV_ADULT',
  GOV_YOI = 'GOV_YOI',
  INAD_ADULT = 'INAD_ADULT',
  INAD_YOI = 'INAD_YOI',
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
