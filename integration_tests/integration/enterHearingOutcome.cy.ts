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
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().should('exist')
      enterHearingOutcomePage.radioButtons().should('exist')
      enterHearingOutcomePage.submitButton().should('exist')
      enterHearingOutcomePage.cancelButton().should('exist')
      enterHearingOutcomePage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to referral reason if police referral selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().type('Roxanne Red')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_POLICE"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start(100))
        expect(loc.search).to.eq('?adjudicator=Roxanne%20Red&hearingOutcomeCode=REFER_POLICE')
      })
    })
    it('goes to referral reason if independent adjudicator referral selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().type('Roxanne Red')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_INAD"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start(100))
        expect(loc.search).to.eq('?adjudicator=Roxanne%20Red&hearingOutcomeCode=REFER_INAD')
      })
    })
    it('goes to plea and finding if hearing complete selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().type('Roxanne Red')
      enterHearingOutcomePage.radioButtons().find('input[value="COMPLETE"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingPleaAndFinding.urls.start(100))
        expect(loc.search).to.eq('?adjudicator=Roxanne%20Red&hearingOutcomeCode=COMPLETE')
      })
    })
    it('goes to reason for adjournment if adjourned selected', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().type('Roxanne Red')
      enterHearingOutcomePage.radioButtons().find('input[value="ADJOURN"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingAdjourned.urls.start(100))
        expect(loc.search).to.eq('?adjudicator=Roxanne%20Red&hearingOutcomeCode=ADJOURN')
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if hearing outcome missing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.adjudicatorName().type('Roxanne Red')
      enterHearingOutcomePage.submitButton().click()
      enterHearingOutcomePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the next step after this hearing')
        })
    })
    it('shows correct error message if adjuicator name is missing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start(100))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
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
