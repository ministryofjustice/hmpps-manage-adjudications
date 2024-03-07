/* eslint-disable import/prefer-default-export */

export enum HearingOutcomeCode {
  COMPLETE = 'COMPLETE',
  REFER_POLICE = 'REFER_POLICE',
  REFER_INAD = 'REFER_INAD',
  ADJOURN = 'ADJOURN',
  NOMIS = 'NOMIS',
  REFER_GOV = 'REFER_GOV',
}

export enum OutcomeCode {
  REFER_POLICE = 'REFER_POLICE',
  REFER_INAD = 'REFER_INAD',
  NOT_PROCEED = 'NOT_PROCEED',
  DISMISSED = 'DISMISSED',
  PROSECUTION = 'PROSECUTION',
  SCHEDULE_HEARING = 'SCHEDULE_HEARING',
  CHARGE_PROVED = 'CHARGE_PROVED',
  QUASHED = 'QUASHED',
  REFER_GOV = 'REFER_GOV',
}

export enum ReferralOutcomeCode {
  NOT_PROCEED = 'NOT_PROCEED',
  PROSECUTION = 'PROSECUTION',
  SCHEDULE_HEARING = 'SCHEDULE_HEARING',
  REFER_POLICE = 'REFER_POLICE',
  REFER_INAD = 'REFER_INAD',
  DISMISSED = 'DISMISSED',
  CHARGE_PROVED = 'CHARGE_PROVED',
  REFER_GOV = 'REFER_GOV',
}

export enum HearingOutcomeFinding {
  CHARGE_PROVED = 'CHARGE_PROVED',
  DISMISSED = 'DISMISSED',
  NOT_PROCEED = 'NOT_PROCEED',
}

export enum HearingOutcomeAdjournReason {
  LEGAL_ADVICE = 'LEGAL_ADVICE',
  LEGAL_REPRESENTATION = 'LEGAL_REPRESENTATION',
  RO_ATTEND = 'RO_ATTEND',
  HELP = 'HELP',
  UNFIT = 'UNFIT',
  WITNESS = 'WITNESS',
  WITNESS_SUPPORT = 'WITNESS_SUPPORT',
  MCKENZIE = 'MCKENZIE',
  EVIDENCE = 'EVIDENCE',
  INVESTIGATION = 'INVESTIGATION',
  OTHER = 'OTHER',
}

export enum HearingOutcomePlea {
  UNFIT = 'UNFIT',
  ABSTAIN = 'ABSTAIN',
  GUILTY = 'GUILTY',
  NOT_GUILTY = 'NOT_GUILTY',
  NOT_ASKED = 'NOT_ASKED',
}

export enum NextStep {
  SCHEDULE_HEARING = 'SCHEDULE_HEARING',
  REFER_POLICE = 'REFER_POLICE',
  NOT_PROCEED = 'NOT_PROCEED',
}

export enum NotProceedReason {
  ANOTHER_WAY = 'ANOTHER_WAY',
  RELEASED = 'RELEASED',
  WITNESS_NOT_ATTEND = 'WITNESS_NOT_ATTEND',
  UNFIT = 'UNFIT',
  FLAWED = 'FLAWED',
  EXPIRED_NOTICE = 'EXPIRED_NOTICE',
  EXPIRED_HEARING = 'EXPIRED_HEARING',
  NOT_FAIR = 'NOT_FAIR',
  OTHER = 'OTHER',
}

export enum QuashGuiltyFindingReason {
  FLAWED_CASE = 'FLAWED_CASE',
  JUDICIAL_REVIEW = 'JUDICIAL_REVIEW',
  APPEAL_UPHELD = 'APPEAL_UPHELD',
  OTHER = 'OTHER',
}

export enum ReferGovReason {
  REVIEW_FOR_REFER_POLICE = 'REVIEW_FOR_REFER_POLICE',
  GOV_INQUIRY = 'GOV_INQUIRY',
  CONSIDER_REFER_POLICE = 'CONSIDER_REFER_POLICE',
  NOT_SERIOUS_FOR_INAD = 'NOT_SERIOUS_FOR_INAD',
  OTHER = 'OTHER',
}

export type HearingDetails = {
  id?: number
  locationId: number
  dateTimeOfHearing: string
  oicHearingType: string
  outcome?: HearingOutcomeDetails
  agencyId?: string
}

export type HearingOutcomeDetails = {
  adjudicator: string
  code: HearingOutcomeCode
  details?: string
  reason?: HearingOutcomeAdjournReason
  plea?: HearingOutcomePlea
  referGovReason?: ReferGovReason
}

export type Outcome = {
  id: number
  code: OutcomeCode
  details: string
  reason?: string
  quashedReason?: QuashGuiltyFindingReason
  canRemove?: boolean
}

export type ReferralOutcome = {
  id: number
  code: ReferralOutcomeCode
  details?: string
  reason?: NotProceedReason
  canRemove?: boolean
}

export type OutcomeDetails = {
  outcome: Outcome
  referralOutcome?: ReferralOutcome
}

export type OutcomeDetailsHistory = {
  outcome: OutcomeDetails
}

export type HearingDetailsHistory = {
  hearing: HearingDetails
  outcome?: OutcomeDetails
}

export type OutcomeHistory = Array<OutcomeDetailsHistory & HearingDetailsHistory>

export interface HearingOutcomeResult extends HearingOutcomeDetails {
  id: number
}

export function convertHearingOutcomeCode(outcomeCode: HearingOutcomeCode) {
  switch (outcomeCode) {
    case HearingOutcomeCode.REFER_POLICE:
      return 'Refer this case to the police'
    case HearingOutcomeCode.REFER_INAD:
      return 'Refer this case to the independent adjudicator'
    case HearingOutcomeCode.ADJOURN:
      return 'Adjourn the hearing for another reason'
    case HearingOutcomeCode.COMPLETE:
      return 'Hearing complete - add adjudication finding'
    default:
      return null
  }
}

export function convertHearingOutcomePlea(outcomePlea: HearingOutcomePlea) {
  switch (outcomePlea) {
    case HearingOutcomePlea.GUILTY:
      return 'Guilty'
    case HearingOutcomePlea.NOT_GUILTY:
      return 'Not guilty'
    case HearingOutcomePlea.ABSTAIN:
      return 'Abstain'
    case HearingOutcomePlea.NOT_ASKED:
      return 'Not asked'
    case HearingOutcomePlea.UNFIT:
      return 'Unfit'
    default:
      return null
  }
}

export function convertHearingOutcomeFinding(outcomeFinding: HearingOutcomeFinding) {
  switch (outcomeFinding) {
    case HearingOutcomeFinding.CHARGE_PROVED:
      return 'Charge proved beyond reasonable doubt'
    case HearingOutcomeFinding.DISMISSED:
      return "Charge dismissed due to 'not guilty' finding"
    case HearingOutcomeFinding.NOT_PROCEED:
      return 'Charge not proceeded with for any other reason'
    default:
      return null
  }
}

export function convertHearingOutcomeAdjournReason(outcomeAdjournReason: HearingOutcomeAdjournReason) {
  switch (outcomeAdjournReason) {
    case HearingOutcomeAdjournReason.EVIDENCE:
      return 'Further evidence needed'
    case HearingOutcomeAdjournReason.HELP:
      return 'Prisoner needs help, such as an interpreter or disability aid'
    case HearingOutcomeAdjournReason.INVESTIGATION:
      return 'Further investigation needed'
    case HearingOutcomeAdjournReason.LEGAL_ADVICE:
      return 'Request for legal advice approved'
    case HearingOutcomeAdjournReason.LEGAL_REPRESENTATION:
      return 'Request for legal representation approved'
    case HearingOutcomeAdjournReason.MCKENZIE:
      return 'Request for McKenzie friend approved'
    case HearingOutcomeAdjournReason.OTHER:
      return 'Other reason'
    case HearingOutcomeAdjournReason.RO_ATTEND:
      return 'Adjourned so that reporting officer can attend'
    case HearingOutcomeAdjournReason.UNFIT:
      return 'Prisoner unfit to proceed'
    case HearingOutcomeAdjournReason.WITNESS:
      return 'Request for witness approved'
    case HearingOutcomeAdjournReason.WITNESS_SUPPORT:
      return 'Request for witness to support mitigation'
    default:
      return null
  }
}
