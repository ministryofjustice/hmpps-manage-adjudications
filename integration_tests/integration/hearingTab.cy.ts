import hearingTab from '../pages/hearingTab'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
  NotProceedReason,
  OutcomeCode,
  OutcomeHistory,
  QuashGuiltyFindingReason,
  ReferralOutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'

const testData = new TestData()

const hearingDateTimeOne = '2030-01-04T09:00:00'
const hearingDateTimeOneFormatted = '4 January 2030 - 09:00'
const hearingDateTimeTwo = '2030-01-06T10:00:00'
const hearingDateTimeTwoFormatted = '6 January 2030 - 10:00'
const hearingDateTimeThree = '2030-01-07T11:00:00'
const hearingDateTimeThreeFormatted = '7 January 2030 - 11:00'

const reportedAdjudicationResponse = (
  chargeNumber: string,
  status: ReportedAdjudicationStatus,
  hearings = [],
  outcomes = [],
  outcomeEnteredInNomis = false
) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber,
      prisonerNumber: 'G6415GD',
      hearings,
      outcomes,
      status,
      otherData: {
        outcomeEnteredInNomis,
      },
    }),
  }
}

const singleHearingNoOutcome = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeOne,
  id: 987,
  locationId: 123,
})

const hearingWithAdjournedOutcome = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeTwo,
  id: 988,
  locationId: 234,
  oicHearingType: OicHearingType.INAD_ADULT,
  agencyId: 'MDI',
  outcome: {
    id: 123,
    adjudicator: 'Judge Green',
    code: HearingOutcomeCode.ADJOURN,
    details: '123',
    reason: HearingOutcomeAdjournReason.EVIDENCE,
    plea: HearingOutcomePlea.NOT_ASKED,
  },
})

const hearingOutcomeEnteredInNOMIS = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeTwo,
  id: 988,
  locationId: 234,
  oicHearingType: OicHearingType.GOV_ADULT,
  outcome: {
    id: 123,
    adjudicator: '',
    code: HearingOutcomeCode.NOMIS,
  },
})

const hearingWithReferToPoliceOutcome = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeTwo,
  id: 988,
  locationId: 234,
  agencyId: 'LEI',
  oicHearingType: OicHearingType.INAD_ADULT,
  outcome: testData.hearingOutcome({ optionalItems: { details: 'This is my reason for referring.' } }),
})

const hearingWithReferToInAdOutcome = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeTwo,
  id: 988,
  locationId: 234,
  oicHearingType: OicHearingType.GOV_ADULT,
  outcome: testData.hearingOutcome({
    code: HearingOutcomeCode.REFER_INAD,
    adjudicator: 'JRED_GEN',
    optionalItems: { details: 'This is my reason for referring.' },
  }),
})

const twoHearings = [hearingWithAdjournedOutcome, singleHearingNoOutcome]

const historyWithOneHearing = [
  {
    hearing: singleHearingNoOutcome,
  },
]

const historyWithOneAdjournedHearing = [
  {
    hearing: hearingWithAdjournedOutcome,
  },
]

const historyWithOneAdjournedHearingEnteredInNomis = [
  {
    hearing: hearingOutcomeEnteredInNOMIS,
  },
]

const historyWithTwoHearings = [
  {
    hearing: hearingWithAdjournedOutcome,
  },
  {
    hearing: singleHearingNoOutcome,
  },
]

const historyWithReferredHearing = [
  {
    hearing: hearingWithReferToPoliceOutcome,
    outcome: { outcome: testData.outcome({ details: 'This is my reason for referring.' }) },
  },
]

const historyWithReferredHearingWithProsecutionOutcome = [
  {
    hearing: hearingWithReferToPoliceOutcome,
    outcome: {
      outcome: testData.outcome({ details: 'This is my reason for referring.' }),
      referralOutcome: testData.referralOutcome({}),
    },
  },
]

const historyWithReferredHearingWithNotProceededOutcome = [
  {
    hearing: hearingWithReferToPoliceOutcome,
    outcome: {
      outcome: testData.outcome({ details: 'This is my reason for referring.' }),
      referralOutcome: testData.referralOutcome({
        code: ReferralOutcomeCode.NOT_PROCEED,
        reason: NotProceedReason.ANOTHER_WAY,
        details: 'This is the reason why I am not proceeding',
      }),
    },
  },
]

const historyWithInAdReferredHearing = [
  {
    hearing: hearingWithReferToInAdOutcome,
    outcome: {
      outcome: testData.outcome({ details: 'This is my reason for referring.', code: OutcomeCode.REFER_INAD }),
    },
  },
]

const historyWithInAdReferredHearingAndScheduleHearingReferralOutcome = [
  {
    hearing: hearingWithReferToInAdOutcome,
    outcome: {
      outcome: testData.outcome({ details: 'This is my reason for referring.', code: OutcomeCode.REFER_INAD }),
      referralOutcome: testData.referralOutcome({ code: ReferralOutcomeCode.SCHEDULE_HEARING }),
    },
  },
  {
    hearing: testData.singleHearing({
      dateTimeOfHearing: hearingDateTimeThree,
      id: 7654,
      locationId: 123,
      oicHearingType: OicHearingType.GOV_ADULT,
    }),
  },
]

const historyWithReferAndHearingInNOMIS = [
  {
    hearing: hearingWithReferToInAdOutcome,
    outcome: {
      outcome: testData.outcome({ details: 'This is my reason for referring.', code: OutcomeCode.REFER_INAD }),
      referralOutcome: testData.referralOutcome({ code: ReferralOutcomeCode.SCHEDULE_HEARING }),
    },
  },
  {
    hearing: hearingOutcomeEnteredInNOMIS,
  },
]

const historyWithNotProceedOutcome = [
  {
    outcome: {
      outcome: testData.outcome({
        code: OutcomeCode.NOT_PROCEED,
        reason: NotProceedReason.EXPIRED_HEARING,
      }),
    },
  },
]

const historyWithPoliceRefer = [
  {
    outcome: {
      outcome: testData.outcome({}),
    },
  },
]
const historyWithPoliceReferAndReferralOutcome = [
  {
    outcome: {
      outcome: testData.outcome({}),
      referralOutcome: testData.referralOutcome({}),
    },
  },
]

const historyWithPoliceReferAndReferralOutcomeNotProceed = [
  {
    outcome: {
      outcome: testData.outcome({}),
      referralOutcome: testData.referralOutcome({
        code: ReferralOutcomeCode.NOT_PROCEED,
        details: 'The time on the notice has expired.',
        reason: NotProceedReason.EXPIRED_NOTICE,
      }),
    },
  },
]

const historyWithCompleteAndDismissedFinding = [
  {
    hearing: testData.singleHearing({
      locationId: 234,
      dateTimeOfHearing: hearingDateTimeThree,
      oicHearingType: OicHearingType.INAD_ADULT,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.COMPLETE,
        optionalItems: {
          plea: HearingOutcomePlea.UNFIT,
        },
      }),
    }),
    outcome: {
      outcome: testData.outcome({ code: OutcomeCode.DISMISSED }),
    },
  },
]

const historyWithCompleteAndNotProceedFinding = [
  {
    hearing: testData.singleHearing({
      locationId: 234,
      dateTimeOfHearing: hearingDateTimeThree,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.COMPLETE,
        adjudicator: 'JRED_GEN',
        optionalItems: {
          plea: HearingOutcomePlea.UNFIT,
        },
      }),
    }),
    outcome: {
      outcome: testData.outcome({ code: OutcomeCode.NOT_PROCEED, reason: NotProceedReason.EXPIRED_HEARING }),
    },
  },
]

const historyWithCompleteAndProvedFinding = [
  {
    hearing: testData.singleHearing({
      locationId: 234,
      dateTimeOfHearing: hearingDateTimeThree,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.COMPLETE,
        adjudicator: 'JRED_GEN',
        optionalItems: {
          plea: HearingOutcomePlea.UNFIT,
        },
      }),
    }),
    outcome: {
      outcome: testData.outcome({ code: OutcomeCode.CHARGE_PROVED, details: null }),
    },
  },
]

const historyWithInAdReferringToGovThenHearing = [
  {
    hearing: testData.singleHearing({
      locationId: 234,
      dateTimeOfHearing: hearingDateTimeThree,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.REFER_INAD,
        adjudicator: 'JRED_GEN',
        optionalItems: {
          details: 'Some details about the independent adjudicator referral',
        },
      }),
    }),
    outcome: {
      outcome: testData.outcome({
        code: OutcomeCode.REFER_INAD,
        details: 'Some details about the independent adjudicator referral',
      }),
      referralOutcome: testData.referralOutcome({
        code: ReferralOutcomeCode.REFER_GOV,
        details: 'reason for referring to the governor',
      }),
    },
  },
  {
    outcome: {
      outcome: testData.outcome({
        code: OutcomeCode.SCHEDULE_HEARING,
      }),
    },
  },
  {
    hearing: testData.singleHearing({
      locationId: 234,
      dateTimeOfHearing: hearingDateTimeThree,
    }),
  },
]

const historyWithInAdReferringToGovThenNotProceed = [
  {
    hearing: testData.singleHearing({
      locationId: 234,
      dateTimeOfHearing: hearingDateTimeThree,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.REFER_INAD,
        adjudicator: 'JRED_GEN',
        optionalItems: {
          details: 'Some details about the independent adjudicator referral',
        },
      }),
    }),
    outcome: {
      outcome: testData.outcome({
        code: OutcomeCode.REFER_INAD,
        details: 'Some details about the independent adjudicator referral',
      }),
      referralOutcome: testData.referralOutcome({
        code: ReferralOutcomeCode.REFER_GOV,
        details: 'reason for referring to the governor',
      }),
    },
  },
  {
    outcome: {
      outcome: testData.outcome({
        code: OutcomeCode.NOT_PROCEED,
        details: 'Too late notice',
        reason: NotProceedReason.EXPIRED_NOTICE,
      }),
    },
  },
]

const historyWithReferGovHearingOutcome = [
  {
    hearing: testData.singleHearing({
      locationId: 234,
      dateTimeOfHearing: hearingDateTimeThree,
      oicHearingType: OicHearingType.INAD_ADULT,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.REFER_GOV,
        adjudicator: 'Jennifer Red',
        optionalItems: {
          details: 'Some details about the governor referral',
        },
      }),
    }),
    outcome: {
      outcome: testData.outcome({
        code: OutcomeCode.REFER_GOV,
        details: 'Needs the big guns',
      }),
      referralOutcome: testData.referralOutcome({
        code: ReferralOutcomeCode.NOT_PROCEED,
        details: 'Reason for not proceeding',
        reason: NotProceedReason.FLAWED,
      }),
    },
  },
]

const historyWithNonRemovableOutcome = [
  {
    hearing: {
      id: 834,
      locationId: 123,
      dateTimeOfHearing: '2023-10-30T15:10:00',
      oicHearingType: OicHearingType.INAD_ADULT,
      outcome: {
        id: 1160,
        adjudicator: 'Jack Jackson',
        code: HearingOutcomeCode.COMPLETE,
        plea: HearingOutcomePlea.GUILTY,
      },
      agencyId: 'MDI',
    },
    outcome: {
      outcome: {
        id: 1544,
        code: OutcomeCode.CHARGE_PROVED,
        canRemove: false,
      },
    },
  },
]

context('Hearing details page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetUserFromUsername', {
      username: 'JRED_GEN',
      response: testData.userFromUsername('JRED_GEN', 'Jennifer Red'),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetLocation', {
      locationId: 123,
      response: {
        locationId: 123,
        agencyId: 'MDI',
        userDescription: 'Adj 1',
      },
    })
    cy.task('stubGetLocation', {
      locationId: 234,
      response: {
        locationId: 234,
        agencyId: 'MDI',
        userDescription: 'Adj 2',
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524493,
      response: reportedAdjudicationResponse('1524493', ReportedAdjudicationStatus.AWAITING_REVIEW),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524480,
      response: reportedAdjudicationResponse('1524480', ReportedAdjudicationStatus.RETURNED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524481,
      response: reportedAdjudicationResponse('1524481', ReportedAdjudicationStatus.REJECTED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse('1524494', ReportedAdjudicationStatus.ACCEPTED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524497,
      response: reportedAdjudicationResponse('1524497', ReportedAdjudicationStatus.UNSCHEDULED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524495,
      response: reportedAdjudicationResponse(
        '1524495',
        ReportedAdjudicationStatus.SCHEDULED,
        [singleHearingNoOutcome],
        historyWithOneHearing
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524300,
      response: reportedAdjudicationResponse(
        '1524300',
        ReportedAdjudicationStatus.SCHEDULED,
        [singleHearingNoOutcome],
        historyWithOneHearing,
        true
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524301,
      response: reportedAdjudicationResponse('1524301', ReportedAdjudicationStatus.UNSCHEDULED, [], [], true),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524498,
      response: reportedAdjudicationResponse(
        '1524498',
        ReportedAdjudicationStatus.ADJOURNED,
        [hearingWithAdjournedOutcome],
        historyWithOneAdjournedHearing
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1111111,
      response: reportedAdjudicationResponse(
        '1111111',
        ReportedAdjudicationStatus.ADJOURNED,
        [hearingOutcomeEnteredInNOMIS],
        historyWithOneAdjournedHearingEnteredInNomis,
        true
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 2222222,
      response: reportedAdjudicationResponse(
        '2222222',
        ReportedAdjudicationStatus.SCHEDULED,
        [],
        historyWithReferAndHearingInNOMIS,
        true
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524302,
      response: reportedAdjudicationResponse(
        '1524302',
        ReportedAdjudicationStatus.ADJOURNED,
        [hearingWithAdjournedOutcome],
        historyWithOneAdjournedHearing,
        true
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524496,
      response: reportedAdjudicationResponse(
        '1524496',
        ReportedAdjudicationStatus.SCHEDULED,
        twoHearings,
        historyWithTwoHearings
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524303,
      response: reportedAdjudicationResponse(
        '1524303',
        ReportedAdjudicationStatus.SCHEDULED,
        twoHearings,
        historyWithTwoHearings,
        true
      ),
    })
    // Adjudication with hearing - referred to police
    cy.task('stubGetReportedAdjudication', {
      id: 1524500,
      response: reportedAdjudicationResponse(
        '1524500',
        ReportedAdjudicationStatus.REFER_POLICE,
        [hearingWithReferToPoliceOutcome],
        historyWithReferredHearing
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524304,
      response: reportedAdjudicationResponse(
        '1524304',
        ReportedAdjudicationStatus.REFER_POLICE,
        [hearingWithReferToPoliceOutcome],
        historyWithReferredHearing,
        true
      ),
    })
    // Adjudication with hearing - referred to ind ad
    cy.task('stubGetReportedAdjudication', {
      id: 1524506,
      response: reportedAdjudicationResponse(
        '1524506',
        ReportedAdjudicationStatus.REFER_INAD,
        [],
        historyWithInAdReferredHearing
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524305,
      response: reportedAdjudicationResponse(
        '1524305',
        ReportedAdjudicationStatus.REFER_INAD,
        [],
        historyWithInAdReferredHearing,
        true
      ),
    })
    // Adjudication with hearing - referred to ind ad with schedule hearing referral outcome
    cy.task('stubGetReportedAdjudication', {
      id: 1524507,
      response: reportedAdjudicationResponse(
        '1524507',
        ReportedAdjudicationStatus.REFER_INAD,
        [],
        historyWithInAdReferredHearingAndScheduleHearingReferralOutcome
      ),
    })
    // Adjudication with hearing - referred to police - with referral outcome - prosecution
    cy.task('stubGetReportedAdjudication', {
      id: 1524501,
      response: reportedAdjudicationResponse(
        '1524501',
        ReportedAdjudicationStatus.REFER_POLICE,
        [hearingWithReferToPoliceOutcome],
        historyWithReferredHearingWithProsecutionOutcome
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524306,
      response: reportedAdjudicationResponse(
        '1524306',
        ReportedAdjudicationStatus.REFER_POLICE,
        [hearingWithReferToPoliceOutcome],
        historyWithReferredHearingWithProsecutionOutcome,
        true
      ),
    })
    // Adjudication with hearing - referred to police - with referral outcome - not proceed
    cy.task('stubGetReportedAdjudication', {
      id: 1524505,
      response: reportedAdjudicationResponse(
        '1524505',
        ReportedAdjudicationStatus.NOT_PROCEED,
        [],
        historyWithReferredHearingWithNotProceededOutcome
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524307,
      response: reportedAdjudicationResponse(
        '1524307',
        ReportedAdjudicationStatus.NOT_PROCEED,
        [],
        historyWithReferredHearingWithNotProceededOutcome,
        true
      ),
    })
    // Adjudication not proceeded with
    cy.task('stubGetReportedAdjudication', {
      id: 1524502,
      response: reportedAdjudicationResponse(
        '1524502',
        ReportedAdjudicationStatus.NOT_PROCEED,
        [],
        historyWithNotProceedOutcome
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524308,
      response: reportedAdjudicationResponse(
        '1524308',
        ReportedAdjudicationStatus.NOT_PROCEED,
        [],
        historyWithNotProceedOutcome,
        true
      ),
    })
    // Adjudication referred to police no hearing
    cy.task('stubGetReportedAdjudication', {
      id: 1524503,
      response: reportedAdjudicationResponse(
        '1524503',
        ReportedAdjudicationStatus.REFER_POLICE,
        [],
        historyWithPoliceRefer
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524309,
      response: reportedAdjudicationResponse(
        '1524309',
        ReportedAdjudicationStatus.REFER_POLICE,
        [],
        historyWithPoliceRefer,
        true
      ),
    })
    // Adjudication referred to police no hearing, referral outcome - not proceed
    cy.task('stubGetReportedAdjudication', {
      id: 1524504,
      response: reportedAdjudicationResponse(
        '1524504',
        ReportedAdjudicationStatus.REFER_POLICE,
        [],
        historyWithPoliceReferAndReferralOutcomeNotProceed
      ),
    })
    // Adjudication hearing complete and dismissed
    cy.task('stubGetReportedAdjudication', {
      id: 1524508,
      response: reportedAdjudicationResponse(
        '1524508',
        ReportedAdjudicationStatus.DISMISSED,
        [historyWithCompleteAndDismissedFinding[0].hearing],
        historyWithCompleteAndDismissedFinding
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524400,
      response: reportedAdjudicationResponse(
        '1524400',
        ReportedAdjudicationStatus.DISMISSED,
        [historyWithCompleteAndDismissedFinding[0].hearing],
        historyWithCompleteAndDismissedFinding,
        true
      ),
    })
    // Adjudication hearing complete and not proceeded with
    cy.task('stubGetReportedAdjudication', {
      id: 1524509,
      response: reportedAdjudicationResponse(
        '1524509',
        ReportedAdjudicationStatus.NOT_PROCEED,
        [historyWithCompleteAndNotProceedFinding[0].hearing],
        historyWithCompleteAndNotProceedFinding
      ),
    })
    // Adjudication hearing complete and proved
    cy.task('stubGetReportedAdjudication', {
      id: 1524510,
      response: reportedAdjudicationResponse(
        '1524510',
        ReportedAdjudicationStatus.CHARGE_PROVED,
        [historyWithCompleteAndProvedFinding[0].hearing],
        historyWithCompleteAndProvedFinding
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524401,
      response: reportedAdjudicationResponse(
        '1524401',
        ReportedAdjudicationStatus.CHARGE_PROVED,
        [historyWithCompleteAndProvedFinding[0].hearing],
        historyWithCompleteAndProvedFinding,
        true
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524402,
      response: reportedAdjudicationResponse(
        '1524402',
        ReportedAdjudicationStatus.QUASHED,
        [historyWithCompleteAndProvedFinding[0].hearing],
        [
          historyWithCompleteAndProvedFinding[0],
          {
            outcome: {
              outcome: testData.outcome({
                code: OutcomeCode.QUASHED,
                details: 'Some details',
                quashedReason: QuashGuiltyFindingReason.FLAWED_CASE,
              }),
            },
          },
        ],
        true
      ),
    })
    // InAd refers to gov, then hearing
    cy.task('stubGetReportedAdjudication', {
      id: 1525967,
      response: reportedAdjudicationResponse(
        '1525967',
        ReportedAdjudicationStatus.SCHEDULED,
        [],
        historyWithInAdReferringToGovThenHearing,
        false
      ),
    })
    // InAd refers to gov, then not proceed
    cy.task('stubGetReportedAdjudication', {
      id: 1525968,
      response: reportedAdjudicationResponse(
        '1525968',
        ReportedAdjudicationStatus.NOT_PROCEED,
        [],
        historyWithInAdReferringToGovThenNotProceed,
        false
      ),
    })
    // InAd hearing, refer to gov hearing outcome
    cy.task('stubGetReportedAdjudication', {
      id: 1525969,
      response: reportedAdjudicationResponse(
        '1525969',
        ReportedAdjudicationStatus.REFER_GOV,
        [],
        historyWithReferGovHearingOutcome,
        false
      ),
    })
    // Report with ADA punishment that has been linked to by an ADA punishment on another report
    cy.task('stubGetReportedAdjudication', {
      id: 1526223,
      response: reportedAdjudicationResponse(
        '1526223',
        ReportedAdjudicationStatus.CHARGE_PROVED,
        [],
        historyWithNonRemovableOutcome,
        false
      ),
    })
    cy.task('stubGetAgency', {
      agencyId: 'MDI',
      response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' },
    })
    cy.task('stubGetAgency', {
      agencyId: 'LEI',
      response: { agencyId: 'LEI', description: 'Leeds (HMP)' },
    })
    cy.signIn()
  })
  describe('Test scenarios - reviewer view', () => {
    beforeEach(() => {
      cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    })
    ;[
      { id: '1524480' },
      { id: '1524481' },
      { id: '1524493' },
      { id: '1524494' },
      { id: '1524497' },
      { id: '1524495' },
      { id: '1524496' },
      { id: '1524500' },
    ].forEach(adj => {
      it('should contain the required page elements', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.review(adj.id))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.reviewStatus().should('exist')
        hearingTabPage.ReturnToAllHearingsLink().should('exist')
        hearingTabPage.viewAllCompletedReportsLink().should('exist')
        if (adj.id === '1524493' || adj.id === '1524480' || adj.id === '1524481') {
          hearingTabPage.schedulingUnavailableP1().should('exist')
          hearingTabPage.schedulingUnavailableP2().should('exist')
          hearingTabPage.noHearingsScheduled().should('not.exist')
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('not.exist')
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
          hearingTabPage.removeHearingButton().should('not.exist')
          hearingTabPage.nextStepConfirmationButton().should('not.exist')
          hearingTabPage.enterHearingOutcomeButton().should('not.exist')
        } else if (adj.id === '1524494') {
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('exist')
        } else if (adj.id === '1524497') {
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
          hearingTabPage.noHearingsScheduled().should('exist')
          hearingTabPage.nextStepRadios().should('exist')
          hearingTabPage.nextStepConfirmationButton().should('exist')
          hearingTabPage.schedulingUnavailableP1().should('not.exist')
          hearingTabPage.schedulingUnavailableP2().should('not.exist')
          hearingTabPage.removeHearingButton().should('not.exist')
        } else if (adj.id === '1524495') {
          // SCHEDULED - single hearing
          hearingTabPage.hearingIndex(1).should('exist')
          hearingTabPage.hearingSummaryTable(1).should('exist')
          hearingTabPage.enterHearingOutcomeButton().should('exist')
          hearingTabPage.removeHearingButton().should('exist')
        } else if (adj.id === '1524500') {
          hearingTabPage.hearingIndex(1).should('exist')
          hearingTabPage.hearingSummaryTable(1).should('exist')
          hearingTabPage.removeHearingButton().should('not.exist')
          hearingTabPage.removeReferralButton().should('exist')
          hearingTabPage.enterReferralOutcomeButton().should('exist')
          hearingTabPage.enterHearingOutcomeButton().should('not.exist')
        } else {
          // SCHEDULED - multiple hearings
          hearingTabPage.hearingIndex(1).should('exist')
          hearingTabPage.hearingIndex(2).should('exist')
          hearingTabPage.hearingSummaryTable(1).should('exist')
          hearingTabPage.hearingSummaryTable(2).should('exist')
          hearingTabPage.enterHearingOutcomeButton().should('exist')
          hearingTabPage.removeHearingButton().should('exist')
        }
      })
    })
    it('Adjudication awaiting review', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524493'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.hearingTabName().contains('Hearings and referrals')
      hearingTabPage.reviewStatus().contains('Awaiting review')
      hearingTabPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingTabPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
    })
    it('Adjudication returned', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524480'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Returned')
      hearingTabPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingTabPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
    })
    it('Adjudication ACCEPTED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524494'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Accepted')
      hearingTabPage.reportAcceptedNoHearingsScheduled().contains('Not scheduled.')
    })
    it('Bottom links work', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524497'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.noHearingsScheduled().contains('No scheduled hearings.')
      hearingTabPage.nextStepConfirmationButton().contains('Continue')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
      hearingTabPage.viewAllCompletedReportsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.urls.start())
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524497'))
      hearingTabPage.ReturnToAllHearingsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.viewScheduledHearings.urls.start())
      })
    })
    it('Adjudication UNSCHEDULED - first radio goes to schedule a hearing page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524497'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadioLegend().contains('What is the next step for this adjudication?')
      hearingTabPage.nextStepRadios().find('input[value="SCHEDULE_HEARING"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.start('1524497'))
      })
    })
    it('Adjudication UNSCHEDULED - second radio goes to refer to police (no hearing) page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524497'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadioLegend().contains('What is the next step for this adjudication?')
      hearingTabPage.nextStepRadios().find('input[value="REFER_POLICE"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForReferral.urls.start('1524497'))
      })
    })
    it('Adjudication UNSCHEDULED - third radio goes to not proceed with page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524497'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadioLegend().contains('What is the next step for this adjudication?')
      hearingTabPage.nextStepRadios().find('input[value="NOT_PROCEED"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.start('1524497'))
      })
    })
    it('Adjudication NOT PROCEEDED WITH', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524502'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.outcomeTableTitle().contains('Not proceeded with')
      hearingTabPage
        .notProceedTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for not proceeding')
        })
      hearingTabPage
        .notProceedTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Hearing open outside timeframe\n\nSome details')
        })
      hearingTabPage.changeOutcomeReason().should('exist')
      hearingTabPage.removeOutcomeButton().should('exist')
      cy.task('stubRemoveNotProceedOrQuashed', {
        chargeNumber: 1524502,
        response: reportedAdjudicationResponse('1524502', ReportedAdjudicationStatus.UNSCHEDULED, [], []),
      })
      cy.task('stubGetReportedAdjudication', {
        id: 1524502,
        response: reportedAdjudicationResponse('1524502', ReportedAdjudicationStatus.UNSCHEDULED, [], []),
      })
      hearingTabPage.removeOutcomeButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524502'))
      })
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadioLegend().contains('What is the next step for this adjudication?')
      hearingTabPage.nextStepRadios().should('exist')
      hearingTabPage.removeOutcomeButton().should('not.exist')
    })
    it('Adjudication REFER TO POLICE, no hearing - prosecution update', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524503'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.outcomeTableTitle().contains('Police referral')
      hearingTabPage
        .policeReferralTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for referral')
        })
      hearingTabPage
        .policeReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Some details')
        })
      cy.get('[data-qa="change-link-outcome-reason-for-referral"]').should('exist')
      hearingTabPage.removeReferralButton().contains('Remove this referral')
      hearingTabPage.enterReferralOutcomeButton().contains('Enter the referral outcome')
      hearingTabPage.enterReferralOutcomeButton().click()
      cy.task('stubCreateProsecution', {
        chargeNumber: 1524503,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '1524503',
            prisonerNumber: 'G6415GD',
            outcomes: historyWithPoliceReferAndReferralOutcome as OutcomeHistory,
          }),
        },
      })
      cy.task('stubGetReportedAdjudication', {
        id: 1524503,
        response: reportedAdjudicationResponse(
          '1524503',
          ReportedAdjudicationStatus.REFER_POLICE,
          [],
          historyWithPoliceReferAndReferralOutcome
        ),
      })
      cy.get('[data-qa="radio-buttons-prosecution"]').find('input[value="yes"]').check()
      cy.get('[data-qa="prosecution-submit"]').click()
      hearingTabPage
        .policeReferralTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabels.get(1).innerText).to.contain('Will this charge continue to prosecution?')
        })
      hearingTabPage
        .policeReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Some details')
          expect($summaryData.get(1).innerText).to.contain('Yes')
        })
      cy.get('[data-qa="change-link-outcome-reason-for-referral"]').should('not.exist')
      hearingTabPage.removeReferralButton().should('exist')
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
    })
    it('Adjudication REFER TO POLICE, no hearing - not proceed update', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524504'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.outcomeTableTitle().contains('Police referral')
      hearingTabPage
        .policeReferralTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabels.get(1).innerText).to.contain('Will this charge continue to prosecution?')
          expect($summaryLabels.get(2).innerText).to.contain('Outcome')
          expect($summaryLabels.get(3).innerText).to.contain('Reason for not proceeding')
        })
      hearingTabPage
        .policeReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Some details')
          expect($summaryData.get(1).innerText).to.contain('No')
          expect($summaryData.get(2).innerText).to.contain('Not proceed with the charge')
          expect($summaryData.get(3).innerText).to.contain(
            'Notice of report issued more than 48 hours after incident\n\nThe time on the notice has expired.'
          )
        })
      hearingTabPage.removeReferralButton().contains('Remove this referral')
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
    })
    it('Adjudication SCHEDULED, one hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524495'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Scheduled')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(3).innerText).to.contain('Change')
          expect($summaryData.get(4).innerText).to.contain('Governor')
          expect($summaryData.get(5).innerText).to.contain('Change')
        })
      hearingTabPage.enterHearingOutcomeButton().contains('Enter the hearing outcome')
      hearingTabPage.removeHearingButton().should('exist')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
    })
    it('Adjudication SCHEDULED, one adjourned hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524498'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Adjourned')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Outcome')
          expect($summaryLabels.get(5).innerText).to.contain('Reason')
          expect($summaryLabels.get(6).innerText).to.contain('Plea')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Green')
          expect($summaryData.get(4).innerText).to.contain('Change')
          expect($summaryData.get(5).innerText).to.contain('Adjourn the hearing for another reason')
          expect($summaryData.get(6).innerText).to.contain('Change')
          expect($summaryData.get(7).innerText).to.contain('Further evidence needed\n\n123')
          expect($summaryData.get(8).innerText).to.contain('Change')
          expect($summaryData.get(9).innerText).to.contain('Not asked')
        })
      hearingTabPage.scheduleAnotherHearingButton().should('exist')
      hearingTabPage.removeHearingButton().should('not.exist')
      hearingTabPage.removeAdjournedHearingButton().should('exist')
      hearingTabPage.enterHearingOutcomeButton().should('not.exist')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
      const response = reportedAdjudicationResponse(
        '1524498',
        ReportedAdjudicationStatus.ADJOURNED,
        [
          testData.singleHearing({
            dateTimeOfHearing: hearingDateTimeTwo,
            id: 988,
            locationId: 234,
            oicHearingType: OicHearingType.INAD_ADULT,
          }),
        ],
        [
          {
            hearing: testData.singleHearing({
              dateTimeOfHearing: hearingDateTimeTwo,
              id: 988,
              locationId: 234,
              oicHearingType: OicHearingType.INAD_ADULT,
            }),
          },
        ]
      )
      cy.task('stubRemoveAdjourn', {
        chargeNumber: 1524498,
        response,
      })
      cy.task('stubGetReportedAdjudication', {
        id: 1524498,
        response,
      })
      hearingTabPage.removeAdjournedHearingButton().click()

      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then(row => {
          expect(row.length).equals(3)
        })
      hearingTabPage.removeHearingButton().should('exist')
      hearingTabPage.removeAdjournedHearingButton().should('not.exist')
    })
    it('Adjudication SCHEDULED multiple hearings to show - first adjourned, second has no outcome', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524496'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Scheduled')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage.hearingIndex(2).contains('Hearing 2')
      hearingTabPage.enterHearingOutcomeButton().should('have.length', 1)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Outcome')
          expect($summaryLabels.get(5).innerText).to.contain('Reason')
          expect($summaryLabels.get(6).innerText).to.contain('Plea')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Green')
          expect($summaryData.get(4).innerText).to.contain('Adjourn the hearing for another reason')
          expect($summaryData.get(5).innerText).to.contain('Further evidence needed\n\n123')
          expect($summaryData.get(6).innerText).to.contain('Not asked')
        })
      hearingTabPage
        .hearingSummaryTable(2)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(3).innerText).to.contain('Change')
          expect($summaryData.get(4).innerText).to.contain('Governor')
          expect($summaryData.get(5).innerText).to.contain('Change')
        })
      hearingTabPage.enterHearingOutcomeButton().should('exist')
      hearingTabPage.removeHearingButton().should('exist')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
    })
    it('Adjudications SCHEDULED - goes to the correct page when you click a change link - single hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524495'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeLink().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.edit('1524495', 987))
      })
    })
    it('Adjudications SCHEDULED - multiple hearings - change links only available on latest hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524496'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeLink().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.edit('1524496', 987)) // should be the latest hearing
      })
    })
    it('Successfully cancels the latest hearing', () => {
      cy.task('stubGetReportedAdjudication', {
        id: 1524497,
        response: reportedAdjudicationResponse(
          '1524497',
          ReportedAdjudicationStatus.SCHEDULED,
          twoHearings,
          historyWithTwoHearings
        ),
      })
      cy.task('stubCancelHearing', {
        chargeNumber: 1524497,
        response: reportedAdjudicationResponse(
          '1524497',
          ReportedAdjudicationStatus.SCHEDULED,
          [hearingWithAdjournedOutcome],
          [
            {
              hearing: hearingWithAdjournedOutcome,
            },
          ]
        ),
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524497'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      cy.task('stubGetReportedAdjudication', {
        id: 1524497,
        response: reportedAdjudicationResponse(
          '1524497',
          ReportedAdjudicationStatus.SCHEDULED,
          [hearingWithAdjournedOutcome],
          [
            {
              hearing: hearingWithAdjournedOutcome,
            },
          ]
        ),
      })
      hearingTabPage.scheduleAnotherHearingButton().should('not.exist')
      hearingTabPage.enterHearingOutcomeButton().should('exist')
      hearingTabPage.removeHearingButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524497'))
      })
      const hearingDetailsPageAfterDeletion = Page.verifyOnPage(hearingTab)
      hearingDetailsPageAfterDeletion.hearingIndex(1).should('exist')
      hearingDetailsPageAfterDeletion.hearingIndex(2).should('not.exist')
      hearingDetailsPageAfterDeletion
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Green')
          expect($summaryData.get(4).innerText).to.contain('Change')
          expect($summaryData.get(5).innerText).to.contain('Adjourn the hearing for another reason')
          expect($summaryData.get(6).innerText).to.contain('Change')
          expect($summaryData.get(7).innerText).to.contain('Further evidence needed\n\n123')
          expect($summaryData.get(8).innerText).to.contain('Change')
          expect($summaryData.get(9).innerText).to.contain('Not asked')
        })
      hearingDetailsPageAfterDeletion.hearingSummaryTable(2).should('not.exist')
      hearingDetailsPageAfterDeletion.removeHearingButton().should('not.exist')
      hearingDetailsPageAfterDeletion.removeAdjournedHearingButton().should('exist')
      hearingDetailsPageAfterDeletion.scheduleAnotherHearingButton().should('exist')
      hearingDetailsPageAfterDeletion.enterHearingOutcomeButton().should('not.exist')
    })
    it('Adjudication with one hearing with a refer to police outcome', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524500'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Outcome')
        })

      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Leeds (HMP)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the police')
        })

      hearingTabPage
        .policeReferralTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for referral')
        })

      hearingTabPage
        .policeReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reason for referring.')
        })

      hearingTabPage.referralChangeLink().should('exist')
      hearingTabPage.enterReferralOutcomeButton().contains('Enter the referral outcome')
      hearingTabPage.removeReferralButton().contains('Remove this referral')
      hearingTabPage.enterReferralOutcomeButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.nextStepsPolice.urls.start('1524500'))
      })
    })
    it('Adjudication with one hearing with a refer to police outcome', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524501'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)

      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Leeds (HMP)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the police')
        })

      hearingTabPage
        .policeReferralTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabels.get(1).innerText).to.contain('Will this charge continue to prosecution?')
        })

      hearingTabPage
        .policeReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reason for referring.')
          expect($summaryData.get(1).innerText).to.contain('Yes')
        })
      hearingTabPage.referralChangeLink().should('not.exist')
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().contains('Remove this referral')
    })

    it('Adjudication with one hearing with a refer to police outcome - successfully removes referral', () => {
      const hearingNoOutcome = testData.singleHearing({
        dateTimeOfHearing: hearingDateTimeTwo,
        id: 988,
        locationId: 234,
        oicHearingType: OicHearingType.INAD_ADULT,
      })
      cy.task('stubRemoveReferral', {
        chargeNumber: 1524500,
        response: reportedAdjudicationResponse(
          '1524500',
          ReportedAdjudicationStatus.SCHEDULED,
          [hearingNoOutcome],
          [{ hearing: hearingNoOutcome }]
        ),
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524500'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)

      cy.task('stubGetReportedAdjudication', {
        id: 1524500,
        response: reportedAdjudicationResponse(
          '1524500',
          ReportedAdjudicationStatus.SCHEDULED,
          [hearingNoOutcome],
          [{ hearing: hearingNoOutcome }]
        ),
      })
      hearingTabPage.referralChangeLink().should('exist')
      hearingTabPage.removeReferralButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524500'))
      })

      hearingTabPage.policeReferralTable().should('not.exist')
    })
    it('Adjudication with a hearing with a refer to police outcome and referral outcome - not proceed', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524505'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)

      hearingTabPage.reviewStatus().contains('Not proceeded with')
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Leeds (HMP)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the police')
        })

      hearingTabPage
        .policeReferralTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabels.get(1).innerText).to.contain('Will this charge continue to prosecution?')
          expect($summaryLabels.get(2).innerText).to.contain('Outcome')
          expect($summaryLabels.get(3).innerText).to.contain('Reason for not proceeding')
        })

      hearingTabPage
        .policeReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reason for referring.')
          expect($summaryData.get(1).innerText).to.contain('No')
          expect($summaryData.get(2).innerText).to.contain('Not proceed with the charge')
          expect($summaryData.get(3).innerText).to.contain(
            'Resolved in another way\n\nThis is the reason why I am not proceeding'
          )
        })

      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().contains('Remove this referral')
      hearingTabPage.referralChangeLink().should('not.exist')
    })

    it('Adjudication with a hearing with a refer to independent adjudicator outcome', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524506'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)

      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the independent adjudicator')
        })

      hearingTabPage.outcomeTableTitle().contains('Independent adjudicator referral')
      hearingTabPage
        .inAdReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Reason for referral')
        })
      hearingTabPage
        .inAdReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reason for referring.')
        })
      hearingTabPage.referralChangeLink().should('exist')
      hearingTabPage.nextStepReferralOutcomeButton().should('exist')
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().contains('Remove this referral')
    })
    it('Adjudication with a hearing with a refer to independent adjudicator outcome and referral outcome of new hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524507'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)

      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the independent adjudicator')
        })

      hearingTabPage.outcomeTableTitle().contains('Independent adjudicator referral')
      hearingTabPage
        .inAdReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .inAdReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reason for referring.')
          expect($summaryData.get(1).innerText).to.contain('Schedule a hearing')
        })
      hearingTabPage.nextStepReferralOutcomeButton().should('not.exist')
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().should('not.exist')
      hearingTabPage.removeHearingButton().should('exist')

      hearingTabPage
        .hearingSummaryTable(2)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(3).innerText).to.contain('Change')
          expect($summaryData.get(4).innerText).to.contain('Governor')
        })
    })
    it('Adjudication hearing complete with dismissed finding', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524508'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Outcome')
          expect($summaryLabels.get(5).innerText).to.contain('Plea')
          expect($summaryLabels.get(6).innerText).to.contain('Finding')
          expect($summaryLabels.get(7).innerText).to.contain('Reason')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Change')
          expect($summaryData.get(5).innerText).to.contain('Hearing complete - add adjudication finding')
          expect($summaryData.get(6).innerText).to.contain('Change')
          expect($summaryData.get(7).innerText).to.contain('Unfit')
          expect($summaryData.get(8).innerText).to.contain('Change')
          expect($summaryData.get(9).innerText).to.contain("Charge dismissed due to 'not guilty' finding")
          expect($summaryData.get(10).innerText).to.contain('Change')
          expect($summaryData.get(11).innerText).to.contain('Some details')
          expect($summaryData.get(12).innerText).to.contain('Change')
        })
      hearingTabPage.removeCompleteHearingOutcomeButton().should('exist')
      hearingTabPage.removeCompleteHearingOutcomeButton().contains('Remove outcome')
      hearingTabPage.removeHearingButton().should('not.exist')
    })
    it('Adjudication hearing complete with not proceed finding', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524509'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Outcome')
          expect($summaryLabels.get(5).innerText).to.contain('Plea')
          expect($summaryLabels.get(6).innerText).to.contain('Finding')
          expect($summaryLabels.get(7).innerText).to.contain('Reason')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Change')
          expect($summaryData.get(5).innerText).to.contain('Hearing complete - add adjudication finding')
          expect($summaryData.get(6).innerText).to.contain('Change')
          expect($summaryData.get(7).innerText).to.contain('Unfit')
          expect($summaryData.get(8).innerText).to.contain('Change')
          expect($summaryData.get(9).innerText).to.contain('Charge not proceeded with for any other reason')
          expect($summaryData.get(10).innerText).to.contain('Change')
          expect($summaryData.get(11).innerText).to.contain('Hearing open outside timeframe\n\nSome details')
          expect($summaryData.get(12).innerText).to.contain('Change')
        })
      hearingTabPage.notProceedTable().should('not.exist')
      hearingTabPage.removeCompleteHearingOutcomeButton().should('exist')
      hearingTabPage.removeCompleteHearingOutcomeButton().contains('Remove outcome')
      hearingTabPage.removeHearingButton().should('not.exist')
    })
    it('Adjudication hearing complete with proved finding', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524510'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Outcome')
          expect($summaryLabels.get(5).innerText).to.contain('Plea')
          expect($summaryLabels.get(6).innerText).to.contain('Finding')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Change')
          expect($summaryData.get(5).innerText).to.contain('Hearing complete - add adjudication finding')
          expect($summaryData.get(6).innerText).to.contain('Change')
          expect($summaryData.get(7).innerText).to.contain('Unfit')
          expect($summaryData.get(8).innerText).to.contain('Change')
          expect($summaryData.get(9).innerText).to.contain('Charge proved beyond reasonable doubt')
          expect($summaryData.get(10).innerText).to.contain('Change')
        })
      hearingTabPage.removeCompleteHearingOutcomeButton().should('exist')
      hearingTabPage.removeHearingButton().should('not.exist')
    })
    it('Removes the whole hearing and outcome when the remove completed hearing button is clicked', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524510'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.hearingSummaryTable(1).should('exist')
      cy.task('stubCancelCompleteHearingOutcome', {
        chargeNumber: 1524510,
        response: reportedAdjudicationResponse('1524510', ReportedAdjudicationStatus.UNSCHEDULED, [], []),
      })
      cy.task('stubGetReportedAdjudication', {
        id: 1524510,
        response: reportedAdjudicationResponse('1524510', ReportedAdjudicationStatus.UNSCHEDULED, [], []),
      })
      hearingTabPage.removeCompleteHearingOutcomeButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524510'))
      })
      hearingTabPage.hearingSummaryTable(1).should('not.exist')
    })
    it('Adds a quashed guilty finding outcome and display correctly in the tables', () => {
      cy.task('stubPostQuashOutcome', {
        chargeNumber: 1524510,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '1524510',
            prisonerNumber: 'G6415GD',
            status: ReportedAdjudicationStatus.QUASHED,
          }),
        },
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524510'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      cy.get("[data-qa='change-link-hearing-outcome-adjudicator-name']").should('exist')
      cy.get("[data-qa='change-link-hearing-outcome-outcome']").should('exist')
      cy.get("[data-qa='change-link-hearing-outcome-plea']").should('exist')
      cy.get("[data-qa='change-link-hearing-outcome-finding']").should('exist')
      hearingTabPage.reportQuashedGuiltyFindingButton().click()
      cy.get('#quashReason').select('Flawed case')
      cy.get('[data-qa="quash-details"]').type('Some details')
      cy.task('stubGetReportedAdjudication', {
        id: 1524510,
        response: reportedAdjudicationResponse(
          '1524510',
          ReportedAdjudicationStatus.QUASHED,
          [historyWithCompleteAndProvedFinding[0].hearing],
          [
            historyWithCompleteAndProvedFinding[0],
            {
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.QUASHED,
                  details: 'Some details',
                  quashedReason: QuashGuiltyFindingReason.FLAWED_CASE,
                }),
              },
            },
          ]
        ),
      })
      cy.get('[data-qa="submit"]').click()
      hearingTabPage.quashedTable().should('exist')
      hearingTabPage
        .quashedTable()
        .find('dd')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Flawed case\n\nSome details')
        })
      cy.get("[data-qa='change-link-hearing-outcome-adjudicator-name']").should('not.exist')
      cy.get("[data-qa='change-link-hearing-outcome-outcome']").should('not.exist')
      cy.get("[data-qa='change-link-hearing-outcome-plea']").should('not.exist')
      cy.get("[data-qa='change-link-hearing-outcome-finding']").should('not.exist')
      cy.get("[data-qa='change-link-quash-guilty-finding']").should('exist')
      hearingTabPage.removeQuashedOutcomeButton().should('exist')
      cy.task('stubGetReportedAdjudication', {
        id: 1524510,
        response: reportedAdjudicationResponse(
          '1524510',
          ReportedAdjudicationStatus.CHARGE_PROVED,
          [historyWithCompleteAndProvedFinding[0].hearing],
          historyWithCompleteAndProvedFinding
        ),
      })
      cy.task('stubRemoveNotProceedOrQuashed', {
        chargeNumber: 1524510,
        response: reportedAdjudicationResponse(
          '1524510',
          ReportedAdjudicationStatus.CHARGE_PROVED,
          [historyWithCompleteAndProvedFinding[0].hearing],
          historyWithCompleteAndProvedFinding
        ),
      })
      hearingTabPage.removeQuashedOutcomeButton().click()
      hearingTabPage.reviewStatus().contains('Charge proved')
      hearingTabPage.quashedTable().should('not.exist')
    })
    it('does not show radio buttons if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524301'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.nextStepRadios().should('not.exist')
    })
    it('does not show button to add an outcome if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524300'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.enterHearingOutcomeButton().should('not.exist')
      hearingTabPage.changeLink().should('not.exist')
    })
    it('does not show button to add an outcome if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524302'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.scheduleAnotherHearingButton().should('not.exist')
      hearingTabPage.removeHearingButton().should('not.exist')
      hearingTabPage.removeAdjournedHearingButton().should('not.exist')
      hearingTabPage.enterHearingOutcomeButton().should('not.exist')
      hearingTabPage.changeLink().should('not.exist')
    })
    it('does not show button to add a hearing outcome if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524303'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.scheduleAnotherHearingButton().should('not.exist')
      hearingTabPage.removeHearingButton().should('not.exist')
      hearingTabPage.enterHearingOutcomeButton().should('not.exist')
      hearingTabPage.changeLink().should('not.exist')
    })
    it('does not show remove referral button or referral change link if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524304'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().should('not.exist')
      hearingTabPage.referralChangeLink().should('not.exist')
    })
    it('does not show remove referral button or referral change link if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524305'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().should('not.exist')
      hearingTabPage.referralChangeLink().should('not.exist')
    })
    it('does not show remove referral button or referral change link if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524306'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.referralChangeLink().should('not.exist')
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().should('not.exist')
    })
    it('does not show enter referral outcome button, remove referral button or referral change link if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524307'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().should('not.exist')
      hearingTabPage.referralChangeLink().should('not.exist')
    })
    it('does not show remove outcome button or change outcome link if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524308'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.removeOutcomeButton().should('not.exist')
      hearingTabPage.changeOutcomeReason().should('not.exist')
    })
    it('does not show remove outcome button or change outcome link if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524309'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.removeOutcomeButton().should('not.exist')
      hearingTabPage.changeOutcomeReason().should('not.exist')
    })
    it('does not show remove outcome button or change outcome link if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524400'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeOutcomeReason().should('not.exist')
      hearingTabPage.removeCompleteHearingOutcomeButton().should('not.exist')
      hearingTabPage.changeLink().should('not.exist')
    })
    it('does not show remove outcome button or change outcome link if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524401'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeOutcomeReason().should('not.exist')
      hearingTabPage.removeCompleteHearingOutcomeButton().should('not.exist')
      hearingTabPage.changeLink().should('not.exist')
    })
    it('does not show change link for quash reason if an outcome has been added in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1524402'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeQuashReasonLink().should('not.exist')
    })
    it('Hearing outcome entered in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1111111'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
        })
      hearingTabPage.scheduleAnotherHearingButton().should('not.exist')
      hearingTabPage.removeHearingButton().should('not.exist')
      hearingTabPage.enterHearingOutcomeButton().should('not.exist')
      hearingTabPage.changeLink().should('not.exist')
    })
    it('Hearing outcome entered in NOMIS - inad referral followed by new hearing scheduled in NOMIS', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('2222222'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the independent adjudicator')
        })

      hearingTabPage.outcomeTableTitle().contains('Independent adjudicator referral')
      hearingTabPage
        .inAdReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .inAdReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reason for referring.')
          expect($summaryData.get(1).innerText).to.contain('Schedule a hearing')
        })
      hearingTabPage
        .hearingSummaryTable(2)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
        })
      hearingTabPage.scheduleAnotherHearingButton().should('not.exist')
      hearingTabPage.removeHearingButton().should('not.exist')
      hearingTabPage.enterHearingOutcomeButton().should('not.exist')
      hearingTabPage.changeLink().should('not.exist')
    })
    it('Refer to gov, next step hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1525967'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the independent adjudicator')
        })

      hearingTabPage.outcomeTableTitle().contains('Independent adjudicator referral')
      hearingTabPage
        .inAdReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .inAdReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Some details about the independent adjudicator referral')
          expect($summaryData.get(1).innerText).to.contain('Refer this case to a governor')
        })
      hearingTabPage.outcomeTableTitle().contains('Governor referral')
      hearingTabPage
        .govReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain(
            'What is the reason for not having an independent adjudicator hearing?'
          )
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .govReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('reason for referring to the governor')
          expect($summaryData.get(1).innerText).to.contain('Schedule a hearing')
        })
      hearingTabPage
        .hearingSummaryTable(2)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(2).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(4).innerText).to.contain('Governor')
        })
      hearingTabPage.removeHearingButton().should('exist')
      hearingTabPage.enterHearingOutcomeButton().should('exist')
    })
    it('Refer to gov, next step not proceed', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1525968'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the independent adjudicator')
        })

      hearingTabPage.outcomeTableTitle().contains('Independent adjudicator referral')
      hearingTabPage
        .inAdReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .inAdReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Some details about the independent adjudicator referral')
          expect($summaryData.get(1).innerText).to.contain('Refer this case to a governor')
        })
      hearingTabPage.outcomeTableTitle().contains('Governor referral')
      hearingTabPage
        .govReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain(
            'What is the reason for not having an independent adjudicator hearing?'
          )
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .govReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('reason for referring to the governor')
          expect($summaryData.get(1).innerText).to.contain('Not proceed')
        })
      hearingTabPage
        .notProceedTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(
            'Notice of report issued more than 48 hours after incident\n\nToo late notice'
          )
        })
      hearingTabPage.removeOutcomeButton().should('exist')
    })
    it('IA Refers to Gov as hearing outcome', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1525969'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the governor')
        })
      hearingTabPage.outcomeTableTitle().contains('Governor referral')
      hearingTabPage
        .govReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain(
            'What is the reason for not having an independent adjudicator hearing?'
          )
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
          expect($summaryLabel.get(2).innerText).to.contain('Reason for not proceeding')
        })
      hearingTabPage
        .govReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Needs the big guns')
          expect($summaryData.get(1).innerText).to.contain('Not proceed with the charge')
          expect($summaryData.get(2).innerText).to.contain('Flawed notice of report\n\nReason for not proceeding')
        })
      hearingTabPage.removeReferralButton().should('exist')
    })
    it('Report has a non-removable outcome due to a linked ADA punishment', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review('1526223'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.removeOutcomeButton().should('not.exist')
    })
  })
  describe('Test scenarios - reporter view', () => {
    ;[
      { id: '1524480' },
      { id: '1524493' },
      { id: '1524494' },
      { id: '1524495' },
      { id: '1524496' },
      { id: '1524497' },
      { id: '1524502' },
      { id: '1524504' },
    ].forEach(adj => {
      it('should contain the required page elements', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.report(adj.id))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.reviewStatus().should('exist')
        hearingTabPage.removeHearingButton().should('not.exist')
        hearingTabPage.viewAllCompletedReportsLink().should('not.exist')
        hearingTabPage.ReturnToAllHearingsLink().should('not.exist')
        if (adj.id === '1524493' || adj.id === '1524480') {
          // AWAITING_REVIEW & RETURNED ADJUDICATIONS
          hearingTabPage.schedulingUnavailableP1().should('exist')
          hearingTabPage.schedulingUnavailableP2().should('exist')
          hearingTabPage.noHearingsScheduled().should('not.exist')
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('not.exist')
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
        } else if (adj.id === '1524494') {
          // ACCEPTED ADJUDICATION
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('exist')
          hearingTabPage.schedulingUnavailableP1().should('not.exist')
          hearingTabPage.schedulingUnavailableP2().should('not.exist')
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
        } else if (adj.id === '1524497') {
          // UNSCHEDULED ADJUDICATION
          hearingTabPage.noHearingsScheduled().should('exist')
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
          hearingTabPage.schedulingUnavailableP1().should('not.exist')
          hearingTabPage.schedulingUnavailableP2().should('not.exist')
          hearingTabPage.nextStepRadios().should('not.exist') // not available to reporters
          hearingTabPage.nextStepConfirmationButton().should('not.exist') // not available to reporters
        } else if (adj.id === '1524502') {
          hearingTabPage.notProceedTable().should('exist')
          hearingTabPage.outcomeTableTitle().contains('Not proceeded with')
          hearingTabPage.removeOutcomeButton().should('not.exist')
        } else if (adj.id === '1524504') {
          hearingTabPage.policeReferralTable().should('exist')
          hearingTabPage.outcomeTableTitle().contains('Police referral')
          hearingTabPage.removeReferralButton().should('not.exist')
        } else {
          // SCHEDULED ADJUDICATION
          hearingTabPage.schedulingUnavailableP1().should('not.exist')
          hearingTabPage.schedulingUnavailableP2().should('not.exist')
          hearingTabPage.noHearingsScheduled().should('not.exist')
          hearingTabPage.enterHearingOutcomeButton().should('not.exist') // not available to reporters
        }
      })
    })
    it('Adjudication awaiting review', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524493'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Awaiting review')
      hearingTabPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingTabPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication ACCEPTED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524494'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Accepted')
      hearingTabPage.reportAcceptedNoHearingsScheduled().contains('Not scheduled.')
    })
    it('Adjudication UNSCHEDULED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524497'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.noHearingsScheduled().contains('No scheduled hearings.')
    })
    it('Adjudication SCHEDULED, one hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524495'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Scheduled')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
        })
    })
    it('Adjudication SCHEDULED multiple hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524496'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Scheduled')
      hearingTabPage.hearingIndex(1).contains('Hearing 1')
      hearingTabPage.hearingIndex(2).contains('Hearing 2')
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Outcome')
          expect($summaryLabels.get(5).innerText).to.contain('Reason')
          expect($summaryLabels.get(6).innerText).to.contain('Plea')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Green')
          expect($summaryData.get(4).innerText).to.contain('Adjourn the hearing for another reason')
          expect($summaryData.get(5).innerText).to.contain('Further evidence needed\n\n123')
          expect($summaryData.get(6).innerText).to.contain('Not asked')
        })
      hearingTabPage
        .hearingSummaryTable(2)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
        })
      hearingTabPage.changeLink().should('not.exist')
    })
    it('Adjudication with a hearing with a refer to independent adjudicator outcome and referral outcome of new hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report('1524507'))
      const hearingTabPage = Page.verifyOnPage(hearingTab)

      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the independent adjudicator')
        })

      hearingTabPage.outcomeTableTitle().contains('Independent adjudicator referral')
      hearingTabPage
        .inAdReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .inAdReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reason for referring.')
          expect($summaryData.get(1).innerText).to.contain('Schedule a hearing')
        })
      hearingTabPage.nextStepReferralOutcomeButton().should('not.exist')
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
      hearingTabPage.removeReferralButton().should('not.exist')
      hearingTabPage.removeHearingButton().should('not.exist')

      hearingTabPage
        .hearingSummaryTable(2)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeThreeFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
        })
    })
  })
})
