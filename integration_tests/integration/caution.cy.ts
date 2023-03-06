import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import CautionPage from '../pages/caution'

const testData = new TestData()
context('Is this punishment a caution?', () => {
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
      cy.visit(adjudicationUrls.isThisACaution.urls.start(100))
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.submitButton().should('exist')
      cautionPage.cancelButton().should('exist')
      cautionPage.cautionRadioButtons().should('exist')
      cautionPage.cautionRadioButtons().find('input[value="yes"]').should('not.be.checked')
      cautionPage.cautionRadioButtons().find('input[value="no"]').should('not.be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.isThisACaution.urls.start(100))
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })

  describe('validation', () => {
    it('should show an error if no option selected', () => {
      cy.visit(adjudicationUrls.isThisACaution.urls.start(100))
      const cautionPage = Page.verifyOnPage(CautionPage)

      cautionPage.submitButton().click()

      cautionPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select yes if the punishment is a caution')
        })
    })
  })

  describe('saves', () => {
    it.only('should submit successfully', () => {
      cy.visit(`${adjudicationUrls.isThisACaution.urls.start(100)}?adjudicator=Tim&plea=GUILTY&amount=100.5`)
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.cautionRadioButtons().find('input[value="yes"]').check()

      cautionPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
})
