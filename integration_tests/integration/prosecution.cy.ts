import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import ProsecutionPage from '../pages/prosecution'
import TestData from '../../server/routes/testutils/testData'

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
      cy.visit(adjudicationUrls.prosecution.urls.start(100))
      const prosecutionPage = Page.verifyOnPage(ProsecutionPage)
      prosecutionPage.submitButton().should('exist')
      prosecutionPage.cancelButton().should('exist')
      prosecutionPage.prosecutionRadioButtons().should('exist')

      prosecutionPage.prosecutionRadioButtons().find('input[value="yes"]').should('not.be.checked')
      prosecutionPage.prosecutionRadioButtons().find('input[value="no"]').should('not.be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.prosecution.urls.start(100))
      const prosecutionPage = Page.verifyOnPage(ProsecutionPage)
      prosecutionPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
    it('shows correct fields when No is selected', () => {
      cy.visit(adjudicationUrls.prosecution.urls.start(100))
      const prosecutionPage = Page.verifyOnPage(ProsecutionPage)
      prosecutionPage.prosecutionRadioButtons().find('input[value="no"]').check()
      prosecutionPage.nextStepRadioButtons().should('exist')
      prosecutionPage.nextStepRadioButtons().find('input[value="schedule_hearing"]').should('not.be.checked')
      prosecutionPage.prosecutionRadioButtons().find('input[value="not_proceed"]').should('not.be.checked')
    })
  })
  describe('Validation', () => {
    it('should show error if no answer to prosecution', () => {
      cy.visit(adjudicationUrls.prosecution.urls.start(100))
      const prosecutionPage = Page.verifyOnPage(ProsecutionPage)

      prosecutionPage.submitButton().click()

      prosecutionPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Missing selection')
        })
    })
    it('should show error if no answer to next steps', () => {
      cy.visit(adjudicationUrls.prosecution.urls.start(100))
      const prosecutionPage = Page.verifyOnPage(ProsecutionPage)
      prosecutionPage.prosecutionRadioButtons().find('input[value="no"]').check()

      prosecutionPage.submitButton().click()

      prosecutionPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the next step')
        })
    })
  })
  describe('Continue', () => {
    it('redirects to hearing review when prosecution is Yes', () => {
      cy.visit(adjudicationUrls.prosecution.urls.start(100))
      const prosecutionPage = Page.verifyOnPage(ProsecutionPage)
      prosecutionPage.prosecutionRadioButtons().find('input[value="yes"]').check()

      prosecutionPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
    it('redirects to schedule hearing when prosecution is No and schedule hearing', () => {
      cy.visit(adjudicationUrls.prosecution.urls.start(100))
      const prosecutionPage = Page.verifyOnPage(ProsecutionPage)
      prosecutionPage.prosecutionRadioButtons().find('input[value="no"]').check()
      prosecutionPage.nextStepRadioButtons().find('input[value="schedule_hearing"]').check()

      prosecutionPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.start(100))
      })
    })
    it('redirects to not proceed reason when prosecution is No and Not proceed', () => {
      cy.visit(adjudicationUrls.prosecution.urls.start(100))
      const prosecutionPage = Page.verifyOnPage(ProsecutionPage)
      prosecutionPage.prosecutionRadioButtons().find('input[value="no"]').check()
      prosecutionPage.nextStepRadioButtons().find('input[value="not_proceed"]').check()

      prosecutionPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      })
    })
  })
})
