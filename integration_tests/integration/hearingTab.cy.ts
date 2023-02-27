import hearingTab from '../pages/hearingTab'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
  OutcomeCode,
  OutcomeHistory,
  ReferralOutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'
import { NotProceedReason } from '../../server/data/OutcomeResult'

const testData = new TestData()

const hearingDateTimeOne = '2030-01-04T09:00:00'
const hearingDateTimeOneFormatted = '4 January 2030 - 09:00'
const hearingDateTimeTwo = '2030-01-06T10:00:00'
const hearingDateTimeTwoFormatted = '6 January 2030 - 10:00'

const reportedAdjudicationResponse = (
  adjudicationNumber: number,
  status: ReportedAdjudicationStatus,
  hearings = [],
  history = []
) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber,
      prisonerNumber: 'G6415GD',
      hearings,
      history,
      status,
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
  outcome: {
    id: 123,
    adjudicator: 'Judge Green',
    code: HearingOutcomeCode.ADJOURN,
    details: '123',
    reason: HearingOutcomeAdjournReason.EVIDENCE,
    plea: HearingOutcomePlea.NOT_ASKED,
  },
})

const hearingWithReferToPoliceOutcome = testData.singleHearing({
  dateTimeOfHearing: hearingDateTimeTwo,
  id: 988,
  locationId: 234,
  oicHearingType: OicHearingType.INAD_ADULT,
  outcome: testData.hearingOutcome({ optionalItems: { details: 'This is my reason for referring.' } }),
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

const historyWithReferredHearingWithOutcome = [
  {
    hearing: hearingWithReferToPoliceOutcome,
    outcome: {
      outcome: testData.outcome({ details: 'This is my reason for referring.' }),
      referralOutcome: testData.referralOutcome({}),
    },
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

context('Hearing details page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
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
      response: reportedAdjudicationResponse(1524493, ReportedAdjudicationStatus.AWAITING_REVIEW),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524480,
      response: reportedAdjudicationResponse(1524480, ReportedAdjudicationStatus.RETURNED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524481,
      response: reportedAdjudicationResponse(1524481, ReportedAdjudicationStatus.REJECTED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, ReportedAdjudicationStatus.ACCEPTED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524497,
      response: reportedAdjudicationResponse(1524497, ReportedAdjudicationStatus.UNSCHEDULED),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524495,
      response: reportedAdjudicationResponse(
        1524495,
        ReportedAdjudicationStatus.SCHEDULED,
        [singleHearingNoOutcome],
        historyWithOneHearing
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524498,
      response: reportedAdjudicationResponse(
        1524498,
        ReportedAdjudicationStatus.SCHEDULED,
        [hearingWithAdjournedOutcome],
        historyWithOneAdjournedHearing
      ),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524496,
      response: reportedAdjudicationResponse(
        1524496,
        ReportedAdjudicationStatus.SCHEDULED,
        twoHearings,
        historyWithTwoHearings
      ),
    })
    // Adjudication with hearing - referred to police
    cy.task('stubGetReportedAdjudication', {
      id: 1524500,
      response: reportedAdjudicationResponse(
        1524500,
        ReportedAdjudicationStatus.REFER_POLICE,
        [hearingWithReferToPoliceOutcome],
        historyWithReferredHearing
      ),
    })
    // Adjudication with hearing - referred to police - with referral outcome
    cy.task('stubGetReportedAdjudication', {
      id: 1524501,
      response: reportedAdjudicationResponse(
        1524501,
        ReportedAdjudicationStatus.REFER_POLICE,
        [hearingWithReferToPoliceOutcome],
        historyWithReferredHearingWithOutcome
      ),
    })
    // Adjudication not proceeded with
    cy.task('stubGetReportedAdjudication', {
      id: 1524502,
      response: reportedAdjudicationResponse(
        1524502,
        ReportedAdjudicationStatus.NOT_PROCEED,
        [],
        historyWithNotProceedOutcome
      ),
    })
    // Adjudication referred to police no hearing
    cy.task('stubGetReportedAdjudication', {
      id: 1524503,
      response: reportedAdjudicationResponse(
        1524503,
        ReportedAdjudicationStatus.REFER_POLICE,
        [],
        historyWithPoliceRefer
      ),
    })
    // Adjudication referred to police no hearing, referral outcome - not proceed
    cy.task('stubGetReportedAdjudication', {
      id: 1524504,
      response: reportedAdjudicationResponse(
        1524504,
        ReportedAdjudicationStatus.REFER_POLICE,
        [],
        historyWithPoliceReferAndReferralOutcomeNotProceed
      ),
    })
    cy.signIn()
  })
  describe('Test scenarios - reviewer view', () => {
    beforeEach(() => {
      cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    })
    ;[
      { id: 1524480 },
      { id: 1524481 },
      { id: 1524493 },
      { id: 1524494 },
      { id: 1524497 },
      { id: 1524495 },
      { id: 1524496 },
      { id: 1524500 },
    ].forEach(adj => {
      it('should contain the required page elements', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.review(adj.id))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.reviewStatus().should('exist')
        hearingTabPage.ReturnToAllHearingsLink().should('exist')
        hearingTabPage.viewAllCompletedReportsLink().should('exist')
        if (adj.id === 1524493 || adj.id === 1524480 || adj.id === 1524481) {
          hearingTabPage.schedulingUnavailableP1().should('exist')
          hearingTabPage.schedulingUnavailableP2().should('exist')
          hearingTabPage.noHearingsScheduled().should('not.exist')
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('not.exist')
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
          hearingTabPage.removeHearingButton().should('not.exist')
          hearingTabPage.nextStepConfirmationButton().should('not.exist')
          hearingTabPage.enterHearingOutcomeButton().should('not.exist')
        } else if (adj.id === 1524494) {
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('exist')
        } else if (adj.id === 1524497) {
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
          hearingTabPage.noHearingsScheduled().should('exist')
          hearingTabPage.nextStepRadios().should('exist')
          hearingTabPage.nextStepConfirmationButton().should('exist')
          hearingTabPage.schedulingUnavailableP1().should('not.exist')
          hearingTabPage.schedulingUnavailableP2().should('not.exist')
          hearingTabPage.removeHearingButton().should('not.exist')
        } else if (adj.id === 1524495) {
          // SCHEDULED - single hearing
          hearingTabPage.hearingIndex(1).should('exist')
          hearingTabPage.hearingSummaryTable(1).should('exist')
          hearingTabPage.enterHearingOutcomeButton().should('exist')
          hearingTabPage.removeHearingButton().should('exist')
        } else if (adj.id === 1524500) {
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
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524493))
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
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524480))
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
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524494))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Accepted')
      hearingTabPage.reportAcceptedNoHearingsScheduled().contains('Not scheduled.')
    })
    it('Bottom links work', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
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
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      hearingTabPage.ReturnToAllHearingsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.viewScheduledHearings.urls.start())
      })
    })
    it('Adjudication UNSCHEDULED - first radio goes to schedule a hearing page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadioLegend().contains('What is the next step for this adjudication?')
      hearingTabPage.nextStepRadios().find('input[value="SCHEDULE_HEARING"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.start(1524497))
      })
    })
    it('Adjudication UNSCHEDULED - second radio goes to refer to police (no hearing) page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadioLegend().contains('What is the next step for this adjudication?')
      hearingTabPage.nextStepRadios().find('input[value="REFER_POLICE"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForReferral.urls.start(1524497))
      })
    })
    it('Adjudication UNSCHEDULED - third radio goes to not proceed with page', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadioLegend().contains('What is the next step for this adjudication?')
      hearingTabPage.nextStepRadios().find('input[value="NOT_PROCEED"]').click()
      hearingTabPage.nextStepConfirmationButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.start(1524497))
      })
    })
    it('Adjudication NOT PROCEEDED WITH', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524502))
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
      hearingTabPage.removeOutcomeButton().should('exist')
      cy.task('stubRemoveNotProceed', {
        adjudicationNumber: 1524502,
        response: reportedAdjudicationResponse(1524502, ReportedAdjudicationStatus.UNSCHEDULED, [], []),
      })
      cy.task('stubGetReportedAdjudication', {
        id: 1524502,
        response: reportedAdjudicationResponse(1524502, ReportedAdjudicationStatus.UNSCHEDULED, [], []),
      })
      hearingTabPage.removeOutcomeButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524502))
      })
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.nextStepRadioLegend().contains('What is the next step for this adjudication?')
      hearingTabPage.nextStepRadios().should('exist')
      hearingTabPage.removeOutcomeButton().should('not.exist')
    })
    it('Adjudication REFER TO POLICE, no hearing - prosection update', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524503))
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
      hearingTabPage.removeReferralButton().contains('Remove this referral')
      hearingTabPage.enterReferralOutcomeButton().contains('Enter the referral outcome')
      hearingTabPage.enterReferralOutcomeButton().click()
      cy.task('stubCreateProsecution', {
        adjudicationNumber: 1524503,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            adjudicationNumber: 1524503,
            prisonerNumber: 'G6415GD',
            history: historyWithPoliceReferAndReferralOutcome as OutcomeHistory,
          }),
        },
      })
      cy.task('stubGetReportedAdjudication', {
        id: 1524503,
        response: reportedAdjudicationResponse(
          1524503,
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
      hearingTabPage.removeReferralButton().should('exist')
      hearingTabPage.enterReferralOutcomeButton().should('not.exist')
    })
    it('Adjudication REFER TO POLICE, no hearing - not proceed update', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524504))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.outcomeTableTitle().contains('Police referral')
      hearingTabPage
        .policeReferralTable()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabels.get(1).innerText).to.contain('Will this charge continue to prosecution?')
          expect($summaryLabels.get(2).innerText).to.contain('Next step')
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
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524495))
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
          expect($summaryData.get(2).innerText).to.contain('Adj 1')
          expect($summaryData.get(4).innerText).to.contain('Governor')
        })
      hearingTabPage.enterHearingOutcomeButton().contains('Enter the hearing outcome')
      hearingTabPage.removeHearingButton().should('exist')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
    })
    it('Adjudication SCHEDULED, one adjourned hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524498))
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
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Next step')
          expect($summaryLabels.get(5).innerText).to.contain('Reason')
          expect($summaryLabels.get(6).innerText).to.contain('Plea')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(2).innerText).to.contain('Adj 2')
          expect($summaryData.get(4).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(6).innerText).to.contain('J. Green')
          expect($summaryData.get(7).innerText).to.contain('Adjourn the hearing for another reason')
          expect($summaryData.get(8).innerText).to.contain('Further evidence needed\n\n123')
          expect($summaryData.get(9).innerText).to.contain('Not asked')
        })
      hearingTabPage.scheduleAnotherHearingButton().should('exist')
      hearingTabPage.removeHearingButton().should('exist')
      hearingTabPage.enterHearingOutcomeButton().should('not.exist')
      hearingTabPage.viewAllCompletedReportsLink().contains('Return to all reports')
      hearingTabPage.ReturnToAllHearingsLink().contains('Return to all hearings')
    })
    it('Adjudication SCHEDULED multiple hearings to show - first adjourned, second has no outcome', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524496))
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
          expect($summaryLabels.get(4).innerText).to.contain('Next step')
          expect($summaryLabels.get(5).innerText).to.contain('Reason')
          expect($summaryLabels.get(6).innerText).to.contain('Plea')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2')
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
          expect($summaryData.get(2).innerText).to.contain('Adj 1')
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
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524495))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeLink().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.edit(1524495, 987))
      })
    })
    it('Adjudications SCHEDULED - multiple hearings - change links only available on latest hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524496))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.changeLink().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.edit(1524496, 987)) // should be the latest hearing
      })
    })
    it('Successfully cancels the latest hearing', () => {
      cy.task('stubGetReportedAdjudication', {
        id: 1524497,
        response: reportedAdjudicationResponse(
          1524497,
          ReportedAdjudicationStatus.SCHEDULED,
          twoHearings,
          historyWithTwoHearings
        ),
      })
      cy.task('stubCancelHearing', {
        adjudicationNumber: 1524497,
        response: reportedAdjudicationResponse(
          1524497,
          ReportedAdjudicationStatus.SCHEDULED,
          [hearingWithAdjournedOutcome],
          [
            {
              hearing: hearingWithAdjournedOutcome,
            },
          ]
        ),
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      cy.task('stubGetReportedAdjudication', {
        id: 1524497,
        response: reportedAdjudicationResponse(
          1524497,
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
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524497))
      })
      const hearingDetailsPageAfterDeletion = Page.verifyOnPage(hearingTab)
      hearingDetailsPageAfterDeletion.hearingIndex(1).should('exist')
      hearingDetailsPageAfterDeletion.hearingIndex(2).should('not.exist')
      hearingDetailsPageAfterDeletion.removeHearingButton().should('exist')
      hearingDetailsPageAfterDeletion
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 2')
          expect($summaryData.get(3).innerText).to.contain('Change')
          expect($summaryData.get(4).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(5).innerText).to.contain('Change')
          expect($summaryData.get(6).innerText).to.contain('J. Green')
          expect($summaryData.get(7).innerText).to.contain('Adjourn the hearing for another reason')
          expect($summaryData.get(8).innerText).to.contain('Further evidence needed\n\n123')
          expect($summaryData.get(9).innerText).to.contain('Not asked')
        })
      hearingDetailsPageAfterDeletion.hearingSummaryTable(2).should('not.exist')
      hearingDetailsPageAfterDeletion.removeHearingButton().should('exist')
      hearingDetailsPageAfterDeletion.scheduleAnotherHearingButton().should('exist')
      hearingDetailsPageAfterDeletion.enterHearingOutcomeButton().should('not.exist')
    })
    it('Adjudication with one hearing with a refer to police outcome', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524500))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Date and time of hearing')
          expect($summaryLabels.get(1).innerText).to.contain('Location')
          expect($summaryLabels.get(2).innerText).to.contain('Type of hearing')
          expect($summaryLabels.get(3).innerText).to.contain('Name of adjudicator')
          expect($summaryLabels.get(4).innerText).to.contain('Next step')
        })

      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 2')
          expect($summaryData.get(3).innerText).to.contain('Change')
          expect($summaryData.get(4).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(5).innerText).to.contain('Change')
          expect($summaryData.get(6).innerText).to.contain('J. Red')
          expect($summaryData.get(7).innerText).to.contain('Refer this case to the police')
        })

      cy.get('[data-qa="outcome-code"]').contains('REFER_POLICE')
      cy.get('[data-qa="outcome-details"]').contains('This is my reason for referring.')

      hearingTabPage.enterReferralOutcomeButton().contains('Enter the referral outcome')
      hearingTabPage.removeReferralButton().contains('Remove this referral')
      hearingTabPage.enterReferralOutcomeButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.nextStepsPolice.urls.start(1524500))
      })
    })
    it('Adjudication with one hearing with a refer to police outcome', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524501))
      const hearingTabPage = Page.verifyOnPage(hearingTab)

      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Change')
          expect($summaryData.get(2).innerText).to.contain('Adj 2')
          expect($summaryData.get(3).innerText).to.contain('Change')
          expect($summaryData.get(4).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(5).innerText).to.contain('Change')
          expect($summaryData.get(6).innerText).to.contain('J. Red')
          expect($summaryData.get(7).innerText).to.contain('Refer this case to the police')
        })

      cy.get('[data-qa="outcome-code"]').contains('REFER_POLICE')
      cy.get('[data-qa="outcome-details"]').contains('This is my reason for referring.')
      cy.get('[data-qa="referral-outcome-code"]').contains('PROSECUTION')

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
        adjudicationNumber: 1524500,
        response: reportedAdjudicationResponse(
          1524500,
          ReportedAdjudicationStatus.SCHEDULED,
          [hearingNoOutcome],
          [{ hearing: hearingNoOutcome }]
        ),
      })
      cy.visit(adjudicationUrls.hearingDetails.urls.review(1524500))
      const hearingTabPage = Page.verifyOnPage(hearingTab)

      cy.task('stubGetReportedAdjudication', {
        id: 1524500,
        response: reportedAdjudicationResponse(
          1524500,
          ReportedAdjudicationStatus.SCHEDULED,
          [hearingNoOutcome],
          [{ hearing: hearingNoOutcome }]
        ),
      })
      hearingTabPage.removeReferralButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524500))
      })

      cy.get('[data-qa="outcome-code"]').should('not.exist')
      cy.get('[data-qa="outcome-details"]').should('not.exist')
    })
  })
  describe('Test scenarios - reporter view', () => {
    ;[
      { id: 1524480 },
      { id: 1524493 },
      { id: 1524494 },
      { id: 1524495 },
      { id: 1524496 },
      { id: 1524497 },
      { id: 1524502 },
      { id: 1524504 },
    ].forEach(adj => {
      it.only('should contain the required page elements', () => {
        cy.visit(adjudicationUrls.hearingDetails.urls.report(adj.id))
        const hearingTabPage = Page.verifyOnPage(hearingTab)
        hearingTabPage.reviewStatus().should('exist')
        hearingTabPage.removeHearingButton().should('not.exist')
        hearingTabPage.viewAllCompletedReportsLink().should('not.exist')
        hearingTabPage.ReturnToAllHearingsLink().should('not.exist')
        if (adj.id === 1524493 || adj.id === 1524480) {
          // AWAITING_REVIEW & RETURNED ADJUDICATIONS
          hearingTabPage.schedulingUnavailableP1().should('exist')
          hearingTabPage.schedulingUnavailableP2().should('exist')
          hearingTabPage.noHearingsScheduled().should('not.exist')
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('not.exist')
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
        } else if (adj.id === 1524494) {
          // ACCEPTED ADJUDICATION
          hearingTabPage.reportAcceptedNoHearingsScheduled().should('exist')
          hearingTabPage.schedulingUnavailableP1().should('not.exist')
          hearingTabPage.schedulingUnavailableP2().should('not.exist')
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
        } else if (adj.id === 1524497) {
          // UNSCHEDULED ADJUDICATION
          hearingTabPage.noHearingsScheduled().should('exist')
          hearingTabPage.hearingSummaryTable(1).should('not.exist')
          hearingTabPage.schedulingUnavailableP1().should('not.exist')
          hearingTabPage.schedulingUnavailableP2().should('not.exist')
          hearingTabPage.nextStepRadios().should('not.exist') // not available to reporters
          hearingTabPage.nextStepConfirmationButton().should('not.exist') // not available to reporters
        } else if (adj.id === 1524502) {
          hearingTabPage.notProceedTable().should('exist')
          hearingTabPage.outcomeTableTitle().contains('Not proceeded with')
          hearingTabPage.removeOutcomeButton().should('not.exist')
        } else if (adj.id === 1524504) {
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
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524493))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Awaiting review')
      hearingTabPage.schedulingUnavailableP1().contains('There are no hearings to schedule at the moment.')
      hearingTabPage
        .schedulingUnavailableP2()
        .contains('You can only schedule a hearing for reports that have been reviewed and accepted.')
    })
    it('Adjudication ACCEPTED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524494))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Accepted')
      hearingTabPage.reportAcceptedNoHearingsScheduled().contains('Not scheduled.')
    })
    it('Adjudication UNSCHEDULED, no hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524497))
      const hearingTabPage = Page.verifyOnPage(hearingTab)
      hearingTabPage.reviewStatus().contains('Unscheduled')
      hearingTabPage.noHearingsScheduled().contains('No scheduled hearings.')
    })
    it('Adjudication SCHEDULED, one hearing', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524495))
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
          expect($summaryData.get(1).innerText).to.contain('Adj 1')
        })
    })
    it('Adjudication SCHEDULED multiple hearings to show', () => {
      cy.visit(adjudicationUrls.hearingDetails.urls.report(1524496))
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
          expect($summaryLabels.get(4).innerText).to.contain('Next step')
          expect($summaryLabels.get(5).innerText).to.contain('Reason')
          expect($summaryLabels.get(6).innerText).to.contain('Plea')
        })
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain(hearingDateTimeTwoFormatted)
          expect($summaryData.get(1).innerText).to.contain('Adj 2')
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
          expect($summaryData.get(1).innerText).to.contain('Adj 1')
          expect($summaryData.get(2).innerText).to.contain('Governor')
        })
      hearingTabPage.changeLink().should('not.exist')
    })
  })
})
