/* eslint-disable import/prefer-default-export */

export enum NextStep {
  SCHEDULE_HEARING = 'SCHEDULE_HEARING',
  REFER_POLICE = 'REFER_POLICE',
  NOT_PROCEED = 'NOT_PROCEED',
}

export enum NotProceedReason {
  RELEASED = 'RELEASED',
  WITNESS_RELEASED = 'WITNESS_RELEASED',
  WITNESS_NOT_ATTEND = 'WITNESS_NOT_ATTEND',
  UNFIT = 'UNFIT',
  FLAWED = 'FLAWED',
  EXPIRED_NOTICE = 'EXPIRED_NOTICE',
  EXPIRED_HEARING = 'EXPIRED_HEARING',
  NOT_FAIR = 'NOT_FAIR',
  PROSECUTED = 'PROSECUTED',
  OTHER = 'OTHER',
}

export enum OutcomeCode {
  PROSECUTION = 'PROSECUTION',
  NOT_PROCEED = 'NOT_PROCEED',
  REFER_INAD = 'REFER_INAD',
  REFER_POLICE = 'REFER_POLICE',
  SCHEDULE_HEARING = 'SCHEDULE_HEARING',
}

export type OutcomeDetails = {
  code: OutcomeCode
  details?: string
  reason?: NotProceedReason
}
