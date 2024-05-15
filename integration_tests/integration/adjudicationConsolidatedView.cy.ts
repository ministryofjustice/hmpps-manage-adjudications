import AdjudicationConsolidatedView from '../pages/adjudicationConsolidatedView'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import {
  DamageDetails,
  EvidenceDetails,
  IncidentStatement,
  WitnessDetails,
} from '../../server/data/DraftAdjudicationResult'
import {
  HearingDetails,
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
  OutcomeCode,
  OutcomeHistory,
  QuashGuiltyFindingReason,
} from '../../server/data/HearingAndOutcomeResult'
import {
  PrivilegeType,
  PunishmentComment,
  PunishmentDataWithSchedule,
  PunishmentType,
} from '../../server/data/PunishmentResult'

const testData = new TestData()
const incidentRole = {
  associatedPrisonersNumber: 'T3356FU',
  roleCode: '25c',
  offenceRule: {
    paragraphNumber: '25(c)',
    paragraphDescription: 'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
  },
}
const offenceDetails = {
  offenceCode: 1001,
  offenceRule: {
    paragraphNumber: '1',
    paragraphDescription: 'Commits any assault',
  },
  victimPrisonersNumber: 'G5512G',
}
const reportedAdjudicationResponse = ({
  chargeNumber,
  status,
  transferableActionsAllowed = false,
  overrideAgencyId = null,
  originatingAgencyId = 'MDI',
  reviewedByUserId = null,
  incidentStatement = { statement: 'TESTING' } as IncidentStatement,
  damages = [testData.singleDamage({})],
  evidence = [testData.singleEvidence({ identifier: 'BT123' })],
  witnesses = [testData.singleWitness({})],
  hearings = [],
  outcomes = [],
  outcomeEnteredInNomis = false,
  punishments = [],
  punishmentComments = [],
}: {
  chargeNumber: string
  status: ReportedAdjudicationStatus
  reviewedByUserId?: string
  incidentStatement?: IncidentStatement
  damages?: DamageDetails[]
  evidence?: EvidenceDetails[]
  witnesses?: WitnessDetails[]
  hearings?: HearingDetails[]
  outcomes?: OutcomeHistory
  outcomeEnteredInNomis?: boolean
  punishments?: PunishmentDataWithSchedule[]
  transferableActionsAllowed?: boolean
  overrideAgencyId?: string
  originatingAgencyId?: string
  punishmentComments?: PunishmentComment[]
}) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-12-09T10:30:00',
      status,
      incidentStatement,
      damages,
      evidence,
      witnesses,
      offenceDetails,
      incidentRole,
      hearings,
      outcomes,
      punishments,
      punishmentComments,
      otherData: {
        reviewedByUserId,
        outcomeEnteredInNomis,
        transferableActionsAllowed,
        overrideAgencyId,
        originatingAgencyId,
      },
    }),
  }
}

const hearingDateTimeOne = '2030-01-04T09:00:00'
const hearingDateTimeOneFormatted = '4 January 2030 - 09:00'
const hearingDateTimeTwo = '2030-01-06T10:00:00'
const hearingDateTimeTwoFormatted = '6 January 2030 - 10:00'
const singleHearingNoOutcome = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeOne,
  id: 987,
  locationId: 2,
})
const hearingWithAdjournedOutcome = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeTwo,
  id: 988,
  locationId: 2,
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
const twoHearings = [hearingWithAdjournedOutcome, singleHearingNoOutcome]
const historyWithOneHearing = [
  {
    hearing: singleHearingNoOutcome,
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
const hearingWithReferToPoliceOutcome = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeTwo,
  id: 988,
  locationId: 2,
  agencyId: 'MDI',
  oicHearingType: OicHearingType.INAD_ADULT,
  outcome: testData.hearingOutcome({ optionalItems: { details: 'This is my reason for referring.' } }),
})
const historyWithReferredHearing = [
  {
    hearing: hearingWithReferToPoliceOutcome,
    outcome: { outcome: testData.outcome({ details: 'This is my reason for referring.' }) },
  },
]
const chargeProvedOutcome = [
  {
    hearing: testData.singleHearing({
      locationId: 2,
      dateTimeOfHearing: '2023-03-10T22:00:00',
      oicHearingType: OicHearingType.INAD_ADULT,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.COMPLETE,
        adjudicator: 'Judith Green',
        optionalItems: {
          plea: HearingOutcomePlea.UNFIT,
        },
      }),
    }),
    outcome: {
      outcome: testData.outcome({
        code: OutcomeCode.CHARGE_PROVED,
      }),
    },
  },
]
const quashedOutcome = [
  chargeProvedOutcome[0],
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
const punishmentsChoc = [
  {
    id: 14,
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.OTHER,
    otherPrivilege: 'chocolate',
    schedule: {
      duration: 10,
      startDate: '2023-04-10',
      endDate: '2023-04-20',
    },
  },
]
const punishmentsCautionDamages = [
  {
    id: 1,
    type: PunishmentType.CAUTION,
    schedule: {
      duration: 0,
    },
  },
  {
    id: 2,
    redisId: 'xyz',
    type: PunishmentType.DAMAGES_OWED,
    schedule: {
      duration: 0,
    },
    damagesOwedAmount: 50,
  },
]

context('Consolidated report', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserOriginatingAgency', 'MDI')
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    // Associated Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
      }),
    })
    cy.task('stubGetUserFromUsername', {
      username: 'JRED_GEN',
      response: testData.userFromUsername('JRED_GEN', 'Jennifer Red'),
    })
    cy.task('stubGetLocation', {
      locationId: 1,
      response: {
        locationId: 1,
        agencyId: 'MDI',
        locationPrefix: 'MDI-1',
        userDescription: 'Houseblock 1',
      },
    })
    cy.task('stubGetLocation', {
      locationId: 2,
      response: {
        locationId: 2,
        agencyId: 'MDI',
        userDescription: 'Adj 1',
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1,
      response: reportedAdjudicationResponse({
        chargeNumber: '1',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        reviewedByUserId: 'USER1',
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 2,
      response: reportedAdjudicationResponse({
        chargeNumber: '2',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        reviewedByUserId: 'USER1',
        damages: [],
        evidence: [],
        witnesses: [],
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 3,
      response: reportedAdjudicationResponse({
        chargeNumber: '3',
        status: ReportedAdjudicationStatus.SCHEDULED,
        reviewedByUserId: 'USER1',
        hearings: [singleHearingNoOutcome],
        outcomes: historyWithOneHearing as OutcomeHistory,
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 4,
      response: reportedAdjudicationResponse({
        chargeNumber: '4',
        status: ReportedAdjudicationStatus.SCHEDULED,
        reviewedByUserId: 'USER1',
        hearings: twoHearings,
        outcomes: historyWithTwoHearings as OutcomeHistory,
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 5,
      response: reportedAdjudicationResponse({
        chargeNumber: '5',
        status: ReportedAdjudicationStatus.REFER_POLICE,
        reviewedByUserId: 'USER1',
        hearings: [hearingWithReferToPoliceOutcome],
        outcomes: historyWithReferredHearing as OutcomeHistory,
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 6,
      response: reportedAdjudicationResponse({
        chargeNumber: '6',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        reviewedByUserId: 'USER1',
        hearings: [chargeProvedOutcome[0].hearing],
        outcomes: chargeProvedOutcome,
        punishments: punishmentsChoc,
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 7,
      response: reportedAdjudicationResponse({
        chargeNumber: '7',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        reviewedByUserId: 'USER1',
        hearings: [chargeProvedOutcome[0].hearing],
        outcomes: chargeProvedOutcome,
        punishments: punishmentsCautionDamages,
        punishmentComments: [testData.singlePunishmentComment({ createdByUserId: 'USER1' })],
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 8,
      response: reportedAdjudicationResponse({
        chargeNumber: '8',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        reviewedByUserId: 'USER1',
        hearings: [chargeProvedOutcome[0].hearing],
        outcomes: chargeProvedOutcome,
        punishments: punishmentsCautionDamages,
        overrideAgencyId: 'LEI',
        originatingAgencyId: 'MDI',
      }),
    })
    // cy.task('stubGetReportedAdjudication', {
    //     id: 1524510,
    //     response: reportedAdjudicationResponse(
    //       '1524510',
    //       ReportedAdjudicationStatus.QUASHED,
    //       [historyWithCompleteAndProvedFinding[0].hearing],
    //       [
    //         historyWithCompleteAndProvedFinding[0],
    //         {
    //           outcome: {
    // outcome: testData.outcome({
    //   code: OutcomeCode.QUASHED,
    //   details: 'Some details',
    //   quashedReason: QuashGuiltyFindingReason.FLAWED_CASE,
    // }),
    //           },
    //         },
    //       ]
    //     ),
    //   })
    cy.task('stubGetReportedAdjudication', {
      id: 9,
      response: reportedAdjudicationResponse({
        chargeNumber: '9',
        status: ReportedAdjudicationStatus.QUASHED,
        reviewedByUserId: 'USER1',
        hearings: [chargeProvedOutcome[0].hearing],
        outcomes: quashedOutcome as unknown as OutcomeHistory,
      }),
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'USER1',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.task('stubGetMovementByOffender', {
      response: testData.prisonerMovement({}),
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    return cy.signIn()
  })
  describe('Report section', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)

      reportPage.reviewSummaryTitle().should('exist')
      reportPage.incidentDetailsSummary().should('exist')
      reportPage.offenceDetailsSummary().should('exist')
      reportPage.incidentStatement().should('exist')
      reportPage.damageSummary().should('exist')
      reportPage.photoVideoEvidenceSummary().should('not.exist')
      reportPage.baggedAndTaggedEvidenceSummary().should('exist')
      reportPage.witnessesSummary().should('exist')
      reportPage.reviewSummary().should('exist')
    })
    it('should contain the correct review summary details', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.reviewSummaryTitle().should('contain.text', 'Unscheduled')
      reportPage
        .reviewSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Last reviewed by')
        })
      reportPage
        .reviewSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
        })
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage
        .incidentDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reporting officer')
          expect($summaryLabels.get(1).innerText).to.contain('Date of incident')
          expect($summaryLabels.get(2).innerText).to.contain('Time of incident')
          expect($summaryLabels.get(3).innerText).to.contain('Location')
          expect($summaryLabels.get(4).innerText).to.contain('Date of discovery')
          expect($summaryLabels.get(5).innerText).to.contain('Time of discovery')
        })
      reportPage
        .incidentDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('T. User')
          expect($summaryData.get(1).innerText).to.contain('9 December 2021')
          expect($summaryData.get(2).innerText).to.contain('10:30')
          expect($summaryData.get(3).innerText).to.contain('Houseblock 1, Moorland (HMP & YOI)')
          expect($summaryData.get(4).innerText).to.contain('9 December 2021')
          expect($summaryData.get(5).innerText).to.contain('10:30')
        })
    })
    it('should contain the correct offence details', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage
        .offenceDetailsSummary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Which set of rules apply to the prisoner?')
          expect($summaryLabels.get(1).innerText).to.contain(
            'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
          )
          expect($summaryLabels.get(2).innerText).to.contain('What did the incident involve?')
          expect($summaryLabels.get(3).innerText).to.contain('Who did John Smith assist James Jones to assault?')
          expect($summaryLabels.get(4).innerText).to.contain('Was the incident a racially aggravated assault?')
          expect($summaryLabels.get(5).innerText).to.contain('This offence broke')
        })
      reportPage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Adult offences\n\nPrison rule 51')
          expect($summaryData.get(1).innerText).to.contain(
            'Assault, fighting, or endangering the health or personal safety of others'
          )
          expect($summaryData.get(2).innerText).to.contain('Assaulting someone')
          expect($summaryData.get(3).innerText).to.contain('Another prisoner - Paul Wright')
          expect($summaryData.get(4).innerText).to.contain('Yes')
          expect($summaryData.get(5).innerText).to.contain(
            'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
          )
        })
    })
    it('should contain the correct damages', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.damageSummary().find('tr').should('have.length', 2) // This includes the header row plus two data rows
      reportPage
        .damageSummary()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Type of repair needed')
          expect($headings.get(1).innerText).to.contain('Description of damage')
        })
      reportPage
        .damageSummary()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Redecoration')
          expect($data.get(1).innerText).to.contain('Some damage details')
        })
    })
    it('should contain the correct evidence', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.baggedAndTaggedEvidenceSummary().find('tr').should('have.length', 2) // This includes the header row plus one data row
      reportPage
        .baggedAndTaggedEvidenceSummary()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Seal number')
          expect($headings.get(1).innerText).to.contain('Description')
        })
      reportPage
        .baggedAndTaggedEvidenceSummary()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('BT123')
          expect($data.get(1).innerText).to.contain('Some details here')
        })
    })
    it('should contain the correct witnesses', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.witnessesSummary().find('tr').should('have.length', 2) // This includes the header row plus two data rows
      reportPage
        .witnessesSummary()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Name')
          expect($headings.get(1).innerText).to.contain('Role')
        })
      reportPage
        .witnessesSummary()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Lastname, Firstname')
          expect($data.get(1).innerText).to.contain('Prison officer')
        })
    })
    it('should contain the correct incident statement', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.incidentStatement().should('contain.text', 'TESTING')
    })
    it('should show correct version if there are no damages, evidence, witnesses, hearings or punishments', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 2))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.damagesAbsentText().should('exist')
      reportPage.evidenceAbsentText().should('exist')
      reportPage.witnessesAbsentText().should('exist')
      reportPage.noHearingsText().should('exist')
      reportPage.noPunishmentsText().should('exist')
    })
  })
  describe('Hearings section', () => {
    it('Scheduled hearing, no outcome', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 3))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.hearingIndex(1).contains('Hearing 1')
      reportPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
        })
      reportPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
        })
    })
    it('Scheduled hearing, first was adjourned', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 4))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.hearingIndex(1).contains('Hearing 1')
      reportPage.hearingIndex(2).contains('Hearing 2')
      reportPage
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
      reportPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Green')
          expect($summaryData.get(4).innerText).to.contain('Adjourn the hearing for another reason')
          expect($summaryData.get(5).innerText).to.contain('Further evidence needed\n\n123')
          expect($summaryData.get(6).innerText).to.contain('Not asked')
        })
      reportPage
        .hearingSummaryTable(2)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeOneFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
        })
    })
    it('Referred to police', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 5))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Red')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the police')
        })

      reportPage
        .policeReferralTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for referral')
        })

      reportPage
        .policeReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reason for referring.')
        })
    })
    it('Quashed stuff', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 9))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage
        .quashedTable()
        .find('dd')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Flawed case\n\nSome details')
        })
      reportPage
        .quashedWarning()
        .contains('The guilty finding has been quashed. Punishments and recovery of damages should not be enforced.')
    })
  })
  describe('Punishments section', () => {
    it('punishments present', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 6))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage
        .awardPunishmentsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contains('Loss of chocolate')
          expect($data.get(1).innerText).to.contains('10 Apr 2023')
          expect($data.get(2).innerText).to.contains('20 Apr 2023')
          expect($data.get(3).innerText).to.contains('10')
          expect($data.get(4).innerText).to.contains('-')
          expect($data.get(5).innerText).to.contains('-')
        })
    })
    it('caution and damages present', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 7))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage
        .damagesMoneyTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Money to be recovered for damages £50')
        })
      reportPage
        .awardPunishmentsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contains('Caution')
        })
    })
    it('shows punishment comments', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 7))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.punishmentCommentsTable().should('exist')
    })
  })
  describe('Transfers', () => {
    it('shows banners', () => {
      cy.visit(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 8))
      const reportPage: AdjudicationConsolidatedView = Page.verifyOnPage(AdjudicationConsolidatedView)
      reportPage.transferBannerHeader().should('exist')
    })
  })
})
