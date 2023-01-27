/* eslint-disable import/prefer-default-export */

export enum HearingOutcomeCode {
  COMPLETE = 'COMPLETE',
  REFER_POLICE = 'REFER_POLICE',
  REFER_INAD = 'REFER_INAD',
  ADJOURN = 'ADJOURN',
}

export enum HearingOutcomeFinding {
  PROVED = 'PROVED',
  DISMISSED = 'DISMISSED',
  NOT_PROCEED_WITH = 'NOT_PROCEED_WITH',
}

export enum HearingOutcomePlea {}
export enum HearingOutcomeReason {}

export type HearingOutcomeDetails = {
  adjudicator: string
  code: HearingOutcomeCode
  details?: string
  reason?: HearingOutcomeReason
  finding?: HearingOutcomeFinding
  plea?: HearingOutcomePlea
}
