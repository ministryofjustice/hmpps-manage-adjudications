import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HearingReasonForFinding from '../pages/hearingReasonForFinding'
import TestData from '../../server/routes/testutils/testData'
import { HearingOutcomeCode, HearingOutcomePlea, OutcomeCode } from '../../server/data/HearingAndOutcomeResult'
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
      adjudicationNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
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
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6415GD',
          outcomes: historyWithCompleteAndDismissedFinding,
          status: ReportedAdjudicationStatus.DISMISSED,
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.hearingReasonForFinding.urls.start(100))
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.findingReason().should('exist')
      HearingReasonForFindingPage.submitButton().should('exist')
      HearingReasonForFindingPage.cancelButton().should('exist')
      HearingReasonForFindingPage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingReasonForFinding.urls.start(100))
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the hearing details page if data successfully submitted', () => {
      cy.visit(`${adjudicationUrls.hearingReasonForFinding.urls.start(100)}?adjudicator=Joanne%20Rhubarb&plea=GUILTY`)
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.findingReason().type('This is the reason for the finding.')
      HearingReasonForFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
    it('goes back to the enter hearing outcome page if the adjudicator name and hearing outcome code is missing', () => {
      cy.visit(adjudicationUrls.hearingReasonForFinding.urls.start(100))
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.findingReason().type('This is the reason for the finding.')
      HearingReasonForFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.enterHearingOutcome.urls.start(100))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason missing', () => {
      cy.visit(adjudicationUrls.hearingReasonForFinding.urls.start(100))
      const HearingReasonForFindingPage = Page.verifyOnPage(HearingReasonForFinding)
      HearingReasonForFindingPage.submitButton().click()
      HearingReasonForFindingPage.errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the reason for this finding')
        })
    })
  })
})
