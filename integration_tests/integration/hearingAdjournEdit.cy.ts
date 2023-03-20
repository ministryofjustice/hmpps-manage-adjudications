import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import HearingAdjourn from '../pages/hearingAdjourn'
import { HearingOutcomeCode, OutcomeHistory } from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Adjourn the hearing', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.ADJOURNED,
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-01-23T17:00:00',
                id: 1,
                locationId: 775,
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.ADJOURN,
                  optionalItems: { details: 'adjourned details', reason: 'LEGAL_ADVICE', plea: 'NOT_ASKED' },
                }),
              }),
            },
          ] as OutcomeHistory,
        }),
      },
    })
    cy.task('stubAmendHearingOutcome', {
      adjudicationNumber: 100,
      status: ReportedAdjudicationStatus.ADJOURNED,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-01-23T17:00:00',
              id: 1,
              locationId: 775,
              outcome: testData.hearingOutcome({
                code: HearingOutcomeCode.ADJOURN,
                optionalItems: { details: 'updated details', plea: 'NOT_GUILTY', reason: 'EVIDENCE' },
              }),
            }),
          ],
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.hearingAdjourned.urls.edit(100))
      const hearingAdjourned = Page.verifyOnPage(HearingAdjourn)
      hearingAdjourned.adjournDetails().should('exist')
      hearingAdjourned.submitButton().should('exist')
      hearingAdjourned.cancelButton().should('exist')
      hearingAdjourned.adjournReason().should('exist')
      hearingAdjourned.adjournPlea().should('exist')
      hearingAdjourned.errorSummary().should('not.exist')
    })
    it('should render the data held on api', () => {
      cy.visit(adjudicationUrls.hearingAdjourned.urls.edit(100))
      const hearingAdjourned = Page.verifyOnPage(HearingAdjourn)
      hearingAdjourned.adjournDetails().should('have.value', 'adjourned details')
      hearingAdjourned.adjournPlea().find('input[value="NOT_ASKED"]').should('be.checked')
      hearingAdjourned.adjournReason().should('have.value', 'LEGAL_ADVICE')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingAdjourned.urls.edit(100))
      const hearingAdjourned = Page.verifyOnPage(HearingAdjourn)
      hearingAdjourned.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the referral confirmation page if data successfully submitted', () => {
      cy.visit(`${adjudicationUrls.hearingAdjourned.urls.edit(100)}?adjudicator=Judge%20Red&hearingOutcome=ADJOURN`)
      const hearingAdjourned = Page.verifyOnPage(HearingAdjourn)

      hearingAdjourned.adjournReason().select('Further evidence needed')
      hearingAdjourned.adjournDetails().type('updated details')
      hearingAdjourned.adjournPlea().find('input[value="NOT_GUILTY"]').check()
      hearingAdjourned.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
    it('goes to the referral confirmation page if data successfully submitted - no new adjudicator passed in query', () => {
      cy.visit(adjudicationUrls.hearingAdjourned.urls.edit(100))
      const hearingAdjourned = Page.verifyOnPage(HearingAdjourn)

      hearingAdjourned.adjournReason().select('Further evidence needed')
      hearingAdjourned.adjournDetails().type('updated details')
      hearingAdjourned.adjournPlea().find('input[value="NOT_GUILTY"]').check()
      hearingAdjourned.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason missing', () => {
      cy.visit(adjudicationUrls.hearingAdjourned.urls.edit(100))
      const hearingAdjourned = Page.verifyOnPage(HearingAdjourn)
      hearingAdjourned.adjournReason().select('Select')
      hearingAdjourned.submitButton().click()
      hearingAdjourned
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the reason for the adjournment')
        })
    })
    it('shows correct error message if details missing', () => {
      cy.visit(adjudicationUrls.hearingAdjourned.urls.edit(100))
      const hearingAdjourned = Page.verifyOnPage(HearingAdjourn)
      hearingAdjourned.adjournReason().select('Request for legal advice approved')
      hearingAdjourned.adjournDetails().clear()
      hearingAdjourned.submitButton().click()
      hearingAdjourned
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the details for the adjournment')
        })
    })
  })
})
