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

export enum HearingOutcomeAdjournReason {
  LEGAL_ADVICE = 'LEGAL_ADVICE',
  LEGAL_REPRESENTATION = 'LEGAL_REPRESENTATION',
  RO_ATTEND = 'RO_ATTEND',
  HELP = 'HELP',
  UNFIT = 'UNFIT',
  WITNESS = 'UNFIT',
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

export type HearingOutcomeDetails = {
  adjudicator: string
  code: HearingOutcomeCode
  details?: string
  reason?: HearingOutcomeAdjournReason
  finding?: HearingOutcomeFinding
  plea?: HearingOutcomePlea
}

export interface HearingOutcomeResult extends HearingOutcomeDetails {
  id: number
}
