import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import EnterHearingOutcomePage from '../pages/enterHearingOutcome'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()
context('Enter hearing outcome', () => {
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
          adjudicationNumber: 100,
          prisonerNumber: 'G6123VU',
          hearings: [
            testData.singleHearing(
              '2023-01-23T17:00:00',
              68,
              775,
              testData.hearingOutcome({ optionalItems: { details: 'A reason for referral' } })
            ),
          ],
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit(100, 68))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().should('exist')
      enterHearingOutcomePage.radioButtons().should('exist')
      enterHearingOutcomePage.submitButton().should('exist')
      enterHearingOutcomePage.cancelButton().should('exist')
      enterHearingOutcomePage.errorSummary().should('not.exist')
    })
    it('should contain the adjudicator name and next step from API call', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit(100, 68))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().should('have.value', 'Judge Red')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_POLICE"]').should('be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit(100, 68))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the correct endpoint after submission if the adjudicators name is changed, query values updated', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit(100, 68))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().clear()
      enterHearingOutcomePage.adjudicatorName().type('Judge Blue')
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.edit(100, 68))
        expect(loc.search).to.eq('?adjudicatorName=Judge%20Blue&hearingOutcome=REFER_POLICE')
      })
    })
    it('goes to correct endpoint if the radio button is changed, query values updated', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit(100, 68))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_INAD"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.edit(100, 68))
        expect(loc.search).to.eq('?adjudicatorName=Judge%20Red&hearingOutcome=REFER_INAD')
      })
    })
    it('goes to correct endpoint even if no changes are made, query values maintained', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit(100, 68))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.edit(100, 68))
        expect(loc.search).to.eq('?adjudicatorName=Judge%20Red&hearingOutcome=REFER_POLICE')
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if adjudicator name is missing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.edit(100, 68))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().clear()
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the name of the adjudicator')
        })
    })
  })
})
