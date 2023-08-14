import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import DamagesOwedPage from '../pages/damagesAmountOwed'

const testData = new TestData()
// V2_ENDPOINTS_FLAG unskip these when we turn flag on
context.skip('Enter the amount to be recovered for damages', () => {
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
      cy.visit(adjudicationUrls.damagesAmount.urls.start('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.submitButton().should('exist')
      damagesOwedPage.cancelButton().should('exist')
      damagesOwedPage.damagesAmount().should('exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.damagesAmount.urls.start('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })

  describe('Validation', () => {
    it(`error when no option selected`, () => {
      cy.visit(adjudicationUrls.damagesAmount.urls.start('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.submitButton().click()

      damagesOwedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the amount to be recovered for damages')
        })
    })
    it(`error when amount is not numeric entered`, () => {
      cy.visit(adjudicationUrls.damagesAmount.urls.start('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesAmount().type('1t3.4')
      damagesOwedPage.submitButton().click()

      damagesOwedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Amount to be recovered for damages must be a number')
        })
    })
  })

  describe('submit', () => {
    it('saves successfully when damages owed', () => {
      cy.visit(adjudicationUrls.damagesAmount.urls.start('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesAmount().type('50')
      damagesOwedPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
})
