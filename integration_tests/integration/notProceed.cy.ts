import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import NotProceedPage from '../pages/notProceed'

const testData = new TestData()
context('Will this charge continue to prosecution?', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubCreateOutcome', {
      adjudicationNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)
      notProceedPage.submitButton().should('exist')
      notProceedPage.cancelButton().should('exist')
      notProceedPage.notProceedDetails().should('exist')
      notProceedPage.notProceedReason().should('exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)
      notProceedPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Validation', () => {
    it('should show error if missing reason', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)

      notProceedPage.submitButton().click()

      notProceedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the reason for not proceeding')
        })
    })
    it('should show error if missing details', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)

      notProceedPage.notProceedReason().select('Other')
      notProceedPage.submitButton().click()

      notProceedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter more details')
        })
    })
  })

  describe('Continue', () => {
    it('redirects to hearing review when saved', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)

      notProceedPage.notProceedReason().select('Other')
      notProceedPage.notProceedDetails().type('details')

      notProceedPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
})
