import moment from 'moment'
import { ReviewStatus } from '../routes/adjudicationForReport/prisonerReport/prisonerReportReviewValidation'
import { AlertFlags } from '../utils/alertHelper'
import {
  DamageDetails,
  EvidenceDetails,
  IncidentDetails,
  IncidentRole,
  IncidentStatement,
  OffenceDetails,
  PrisonerGender,
  WitnessDetails,
} from './DraftAdjudicationResult'
import { LocationId } from './PrisonLocationResult'
import { HearingDetails, OutcomeHistory } from './HearingAndOutcomeResult'
import { PunishmentDataWithSchedule } from './PunishmentResult'

export type ReportedAdjudication = {
  adjudicationNumber: number
  prisonerNumber: string
  bookingId: number
  createdDateTime: string
  createdByUserId: string
  incidentDetails: IncidentDetails
  incidentStatement: IncidentStatement
  incidentRole: IncidentRole
  offenceDetails: OffenceDetails
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
  dateTimeOfFirstHearing?: string
  outcomes?: OutcomeHistory
  punishments?: PunishmentDataWithSchedule[]
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
  formattedDateTimeOfFirstHearing?: string
  dateTimeOfFirstHearing?: string
  issueStatus?: IssueStatus
  relevantAlerts?: AlertFlags[]
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
  issueStatus?: IssueStatus | IssueStatus[]
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
  ADJOURNED = 'ADJOURNED',
  NOT_PROCEED = 'NOT_PROCEED',
  DISMISSED = 'DISMISSED',
  REFER_POLICE = 'REFER_POLICE',
  REFER_INAD = 'REFER_INAD',
  CHARGE_PROVED = 'CHARGE_PROVED',
  QUASHED = 'QUASHED',
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
    case ReportedAdjudicationStatus.ADJOURNED:
      return 'Adjourned'
    case ReportedAdjudicationStatus.NOT_PROCEED:
      return 'Not proceeded with'
    case ReportedAdjudicationStatus.DISMISSED:
      return 'Dismissed'
    case ReportedAdjudicationStatus.REFER_POLICE:
      return 'Referred to police'
    case ReportedAdjudicationStatus.REFER_INAD:
      return 'Referred to IA'
    case ReportedAdjudicationStatus.CHARGE_PROVED:
      return 'Charge proved'
    case ReportedAdjudicationStatus.QUASHED:
      return 'Quashed'
    default:
      return null
  }
}

export enum IssueStatus {
  ISSUED = 'ISSUED',
  NOT_ISSUED = 'NOT_ISSUED',
}

export const allIssueStatuses = [IssueStatus.ISSUED, IssueStatus.NOT_ISSUED]
