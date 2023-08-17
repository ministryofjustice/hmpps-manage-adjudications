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
import { PunishmentComment, PunishmentDataWithSchedule } from './PunishmentResult'

export type ReportedAdjudication = {
  chargeNumber: string
  prisonerNumber: string
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
  punishmentComments?: PunishmentComment[]
  outcomeEnteredInNomis?: boolean
  transferableActionsAllowed?: boolean
  overrideAgencyId?: string
  originatingAgencyId?: string
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
  transfersOnly?: boolean
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
  status: ReportedAdjudicationStatus
  prisonerNumber: string
  oicHearingType: OicHearingType
  chargeNumber: string
}

export interface ScheduledHearingEnhanced extends ScheduledHearing {
  friendlyName: string
  nameAndNumber: string
  formattedDateTimeOfHearing: string
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
  UNSCHEDULED = 'UNSCHEDULED',
  SCHEDULED = 'SCHEDULED',
  ADJOURNED = 'ADJOURNED',
  NOT_PROCEED = 'NOT_PROCEED',
  DISMISSED = 'DISMISSED',
  REFER_POLICE = 'REFER_POLICE',
  PROSECUTION = 'PROSECUTION',
  REFER_INAD = 'REFER_INAD',
  CHARGE_PROVED = 'CHARGE_PROVED',
  QUASHED = 'QUASHED',
  ACCEPTED = 'ACCEPTED',
}

export const allStatuses = [
  ReportedAdjudicationStatus.SCHEDULED,
  ReportedAdjudicationStatus.UNSCHEDULED,
  ReportedAdjudicationStatus.AWAITING_REVIEW,
  ReportedAdjudicationStatus.RETURNED,
  ReportedAdjudicationStatus.REJECTED,
  ReportedAdjudicationStatus.ADJOURNED,
  ReportedAdjudicationStatus.NOT_PROCEED,
  ReportedAdjudicationStatus.DISMISSED,
  ReportedAdjudicationStatus.REFER_POLICE,
  ReportedAdjudicationStatus.REFER_INAD,
  ReportedAdjudicationStatus.CHARGE_PROVED,
  ReportedAdjudicationStatus.QUASHED,
  ReportedAdjudicationStatus.PROSECUTION,
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
    case ReportedAdjudicationStatus.PROSECUTION:
      return 'Police prosecution'
    default:
      return null
  }
}

export enum IssueStatus {
  ISSUED = 'ISSUED',
  NOT_ISSUED = 'NOT_ISSUED',
}

export const allIssueStatuses = [IssueStatus.ISSUED, IssueStatus.NOT_ISSUED]
