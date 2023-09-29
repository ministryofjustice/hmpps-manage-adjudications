import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentIsSuspendedPage from '../pages/punishmentIsSuspended'

const testData = new TestData()
context('Punishment - is it suspended?', () => {
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
      cy.visit(adjudicationUrls.punishmentIsSuspended.urls.start('100'))
      const punishmentIsSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentIsSuspendedPage.submitButton().should('exist')
      punishmentIsSuspendedPage.cancelButton().should('exist')
      punishmentIsSuspendedPage.suspended().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentIsSuspended.urls.start('100'))
      const punishmentIsSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentIsSuspendedPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no suspended option selected', () => {
      cy.visit(adjudicationUrls.punishmentIsSuspended.urls.start('100'))
      const punishmentIsSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentIsSuspendedPage.submitButton().click()
      punishmentIsSuspendedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select yes if this punishment is to be suspended')
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it('should go to correct page when suspended', () => {
      cy.visit(adjudicationUrls.punishmentIsSuspended.urls.start('100'))
      const punishmentIsSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentIsSuspendedPage.suspended().find('input[value="yes"]').check()
      punishmentIsSuspendedPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentSuspendedUntil.urls.start('100'))
      })
    })
    it('should go to correct page when not suspended', () => {
      cy.visit(adjudicationUrls.punishmentIsSuspended.urls.start('100'))
      const punishmentIsSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentIsSuspendedPage.suspended().find('input[value="no"]').check()
      punishmentIsSuspendedPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.whenWillPunishmentStart.urls.start('100'))
      })
    })
  })
})
