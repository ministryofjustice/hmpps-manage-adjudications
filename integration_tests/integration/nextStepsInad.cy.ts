import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import NextStepsInadPage from '../pages/nextStepsInad'

const testData = new TestData()
context('What is the next step?', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.nextStepsInad.urls.start('100'))
      const nextStepsInadPage = Page.verifyOnPage(NextStepsInadPage)
      nextStepsInadPage.submitButton().should('exist')
      nextStepsInadPage.cancelButton().should('exist')
      nextStepsInadPage.nextStepRadioButtons().should('exist')
      nextStepsInadPage.nextStepRadioButtons().find('input[value="schedule_hearing"]').should('not.be.checked')
      nextStepsInadPage.nextStepRadioButtons().find('input[value="not_proceed"]').should('not.be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.nextStepsInad.urls.start('100'))
      const nextStepsInadPage = Page.verifyOnPage(NextStepsInadPage)
      nextStepsInadPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should show error if no answer selected', () => {
      cy.visit(adjudicationUrls.nextStepsInad.urls.start('100'))
      const nextStepsInadPage = Page.verifyOnPage(NextStepsInadPage)

      nextStepsInadPage.submitButton().click()

      nextStepsInadPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the next step')
        })
    })
  })
  describe('Continue', () => {
    it('redirects to schedule hearing when schedule hearing', () => {
      cy.visit(adjudicationUrls.nextStepsInad.urls.start('100'))
      const nextStepsInadPage = Page.verifyOnPage(NextStepsInadPage)
      nextStepsInadPage.nextStepRadioButtons().find('input[value="schedule_hearing"]').check({ force: true })
      nextStepsInadPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.start('100'))
      })
    })
    it('redirects to not proceed reason when  Not proceed', () => {
      cy.visit(adjudicationUrls.nextStepsInad.urls.start('100'))
      const nextStepsInadPage = Page.verifyOnPage(NextStepsInadPage)
      nextStepsInadPage.nextStepRadioButtons().find('input[value="not_proceed"]').check({ force: true })

      nextStepsInadPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.start('100'))
      })
    })
  })
})
