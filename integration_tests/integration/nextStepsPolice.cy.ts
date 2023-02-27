import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import NextStepsPolice from '../pages/nextStepsPolice'
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
    cy.task('stubCreateProsecution', {
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
      cy.visit(adjudicationUrls.nextStepsPolice.urls.start(100))
      const nextStepsPolicePage = Page.verifyOnPage(NextStepsPolice)
      nextStepsPolicePage.submitButton().should('exist')
      nextStepsPolicePage.cancelButton().should('exist')
      nextStepsPolicePage.prosecutionRadioButtons().should('exist')

      nextStepsPolicePage.prosecutionRadioButtons().find('input[value="yes"]').should('not.be.checked')
      nextStepsPolicePage.prosecutionRadioButtons().find('input[value="no"]').should('not.be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.nextStepsPolice.urls.start(100))
      const nextStepsPolicePage = Page.verifyOnPage(NextStepsPolice)
      nextStepsPolicePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
    it('shows correct fields when No is selected', () => {
      cy.visit(adjudicationUrls.nextStepsPolice.urls.start(100))
      const nextStepsPolicePage = Page.verifyOnPage(NextStepsPolice)
      nextStepsPolicePage.prosecutionRadioButtons().find('input[value="no"]').check()
      nextStepsPolicePage.nextStepRadioButtons().should('exist')
      nextStepsPolicePage.nextStepRadioButtons().find('input[value="schedule_hearing"]').should('not.be.checked')
      nextStepsPolicePage.nextStepRadioButtons().find('input[value="not_proceed"]').should('not.be.checked')
    })
  })
  describe('Validation', () => {
    it('should show error if no answer to prosecution', () => {
      cy.visit(adjudicationUrls.nextStepsPolice.urls.start(100))
      const nextStepsPolicePage = Page.verifyOnPage(NextStepsPolice)

      nextStepsPolicePage.submitButton().click()

      nextStepsPolicePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select yes if this charge will continue to prosecution')
        })
    })
    it('should show error if no answer to next steps', () => {
      cy.visit(adjudicationUrls.nextStepsPolice.urls.start(100))
      const nextStepsPolicePage = Page.verifyOnPage(NextStepsPolice)
      nextStepsPolicePage.prosecutionRadioButtons().find('input[value="no"]').check()

      nextStepsPolicePage.submitButton().click()

      nextStepsPolicePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the next step')
        })
    })
  })
  describe('Continue', () => {
    it('redirects to hearing review when prosecution is Yes', () => {
      cy.visit(adjudicationUrls.nextStepsPolice.urls.start(100))
      const nextStepsPolicePage = Page.verifyOnPage(NextStepsPolice)
      nextStepsPolicePage.prosecutionRadioButtons().find('input[value="yes"]').check()

      nextStepsPolicePage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
    it('redirects to schedule hearing when prosecution is No and schedule hearing', () => {
      cy.visit(adjudicationUrls.nextStepsPolice.urls.start(100))
      const nextStepsPolicePage = Page.verifyOnPage(NextStepsPolice)
      nextStepsPolicePage.prosecutionRadioButtons().find('input[value="no"]').check()
      nextStepsPolicePage.nextStepRadioButtons().find('input[value="schedule_hearing"]').check()

      nextStepsPolicePage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.scheduleHearing.urls.start(100))
      })
    })
    it('redirects to not proceed reason when prosecution is No and Not proceed', () => {
      cy.visit(adjudicationUrls.nextStepsPolice.urls.start(100))
      const nextStepsPolicePage = Page.verifyOnPage(NextStepsPolice)
      nextStepsPolicePage.prosecutionRadioButtons().find('input[value="no"]').check()
      nextStepsPolicePage.nextStepRadioButtons().find('input[value="not_proceed"]').check()

      nextStepsPolicePage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      })
    })
  })
})
