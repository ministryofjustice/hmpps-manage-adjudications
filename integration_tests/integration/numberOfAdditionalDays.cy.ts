import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import NumberOfAdditionalDaysPage from '../pages/numberOfAdditionalDays'

const testData = new TestData()
context('Number of additional days', () => {
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
      cy.visit(adjudicationUrls.numberOfAdditionalDays.urls.start('100'))
      const numberOfAdditionalDaysPage = Page.verifyOnPage(NumberOfAdditionalDaysPage)
      numberOfAdditionalDaysPage.submitButton().should('exist')
      numberOfAdditionalDaysPage.cancelButton().should('exist')
      numberOfAdditionalDaysPage.days().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.numberOfAdditionalDays.urls.start('100'))
      const numberOfAdditionalDaysPage = Page.verifyOnPage(NumberOfAdditionalDaysPage)
      numberOfAdditionalDaysPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no days entered', () => {
      cy.visit(adjudicationUrls.numberOfAdditionalDays.urls.start('100'))
      const numberOfAdditionalDaysPage = Page.verifyOnPage(NumberOfAdditionalDaysPage)
      numberOfAdditionalDaysPage.submitButton().click()

      numberOfAdditionalDaysPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter how many days the punishment will last')
        })
    })
    it('should error when something other than a number over 1 is entered', () => {
      cy.visit(adjudicationUrls.numberOfAdditionalDays.urls.start('100'))
      const numberOfAdditionalDaysPage = Page.verifyOnPage(NumberOfAdditionalDaysPage)
      numberOfAdditionalDaysPage.days().type('l')
      numberOfAdditionalDaysPage.submitButton().click()

      numberOfAdditionalDaysPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter a number of days')
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it('should redirect when days are entered correctly', () => {
      cy.visit(adjudicationUrls.numberOfAdditionalDays.urls.start('100'))
      const numberOfAdditionalDaysPage = Page.verifyOnPage(NumberOfAdditionalDaysPage)
      numberOfAdditionalDaysPage.days().type('10')
      numberOfAdditionalDaysPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isPunishmentSuspended.urls.start('100'))
      })
    })
  })
})
