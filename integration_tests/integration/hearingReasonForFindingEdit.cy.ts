import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HearingReasonForFinding from '../pages/hearingReasonForFinding'
import TestData from '../../server/routes/testutils/testData'
import {
  HearingOutcomeCode,
  HearingOutcomeFinding,
  HearingOutcomePlea,
  OutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
const historyWithCompleteAndDismissedFinding = [
  {
    hearing: testData.singleHearing({
      locationId: 234,
      dateTimeOfHearing: '2030-01-07T11:00:00',
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.COMPLETE,
        optionalItems: {
          plea: HearingOutcomePlea.GUILTY,
        },
      }),
    }),
    outcome: {
      outcome: testData.outcome({ code: OutcomeCode.DISMISSED }),
    },
  },
]

context('What is the reason for this finding?', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubPostCompleteDismissedHearing', {
      chargeNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
          outcomes: historyWithCompleteAndDismissedFinding,
        }),
      },
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
      locationId: 234,
      response: {
        locationId: 234,
        agencyId: 'MDI',
        userDescription: 'Adj 2',
      },
    })
    cy.signIn()
    cy.task('stubGetReportedAdjudicationV1', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.DISMISSED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-01-23T17:00:00',
              id: 1,
              locationId: 775,
              outcome: testData.hearingOutcome({
                code: HearingOutcomeCode.COMPLETE,
                optionalItems: { plea: HearingOutcomePlea.GUILTY, finding: HearingOutcomeFinding.CHARGE_PROVED },
              }),
            }),
          ],
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.DISMISSED,
                  details: 'reason details',
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          prisonerNumber: 'G6415GD',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-01-23T17:00:00',
              id: 1,
              locationId: 775,
              outcome: testData.hearingOutcome({
                code: HearingOutcomeCode.COMPLETE,
                optionalItems: { plea: HearingOutcomePlea.GUILTY, finding: HearingOutcomeFinding.CHARGE_PROVED },
              }),
            }),
          ],
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                  caution: true,
                  amount: 100.5,
                  details: null,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubAmendHearingOutcome', {
      chargeNumber: 101,
      status: ReportedAdjudicationStatus.DISMISSED,
      response: {},
    })
  })
  describe('Loads', () => {
    it('should contain the required page elements with reason showing', () => {
      cy.visit(adjudicationUrls.hearingReasonForFinding.urls.edit('100'))
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.findingReason().should('exist')
      HearingReasonForFindingPage.findingReason().contains('reason details')
      HearingReasonForFindingPage.submitButton().should('exist')
      HearingReasonForFindingPage.cancelButton().should('exist')
      HearingReasonForFindingPage.errorSummary().should('not.exist')
    })
    it('should contain the required page elements with no reason showing', () => {
      cy.visit(adjudicationUrls.hearingReasonForFinding.urls.edit('101'))
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.findingReason().should('exist')
      HearingReasonForFindingPage.findingReason().should('have.value', '')
      HearingReasonForFindingPage.submitButton().should('exist')
      HearingReasonForFindingPage.cancelButton().should('exist')
      HearingReasonForFindingPage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingReasonForFinding.urls.edit('100'))
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the hearing details page if data successfully submitted', () => {
      cy.visit(`${adjudicationUrls.hearingReasonForFinding.urls.edit('101')}`)
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.findingReason().type('This is the reason for the finding.')
      HearingReasonForFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('101'))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason missing', () => {
      cy.visit(adjudicationUrls.hearingReasonForFinding.urls.edit('100'))
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.findingReason().clear()
      HearingReasonForFindingPage.submitButton().click()
      HearingReasonForFindingPage.errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the reason for this finding')
        })
    })
  })
})
