import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import HearingCheckAnswersPage from '../pages/hearingCheckYourAnswers'

const testData = new TestData()

context('Check your answers before submitting', () => {
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
    cy.task('stubPostCompleteHearingChargeProved', {
      adjudicationNumber: 100,
      response: {},
    })
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(
        `${adjudicationUrls.hearingsCheckAnswers.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=500.0`
      )
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.submitButton().should('exist')
      checkAnswersPage.cancelLink().should('exist')
      checkAnswersPage.answersTable().should('exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(
        `${adjudicationUrls.hearingsCheckAnswers.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=500.0`
      )
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.cancelLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
    it('shows the correct information in the summary table - money amount provided', () => {
      cy.visit(
        `${adjudicationUrls.hearingsCheckAnswers.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=500.0`
      )
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage
        .answersTable()
        .get('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Is any money being recovered for damages?')
          expect($summaryLabels.get(1).innerText).to.contain('Is the punishment a caution?')
        })
      checkAnswersPage
        .answersTable()
        .get('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Yes: £500.0')
          expect($summaryData.get(2).innerText).to.contain('Yes')
        })
    })
    it('shows the correct information in the summary table - money amount not provided', () => {
      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage
        .answersTable()
        .get('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('No')
        })
    })
  })

  describe('saves', () => {
    it('should submit successfully', () => {
      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.start(100)}?adjudicator=Roxanne%20Red&plea=GUILTY&amount=`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      })
    })
    it('goes back to enter hearing outcome page if the query parameters are lost', () => {
      cy.visit(adjudicationUrls.hearingsCheckAnswers.urls.start(100))
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage
        .answersTable()
        .get('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('No')
        })
      checkAnswersPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.enterHearingOutcome.urls.start(100))
      })
    })
  })
})
