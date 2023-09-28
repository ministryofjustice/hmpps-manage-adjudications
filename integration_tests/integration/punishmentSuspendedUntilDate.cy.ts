import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentSuspendedUntilPage from '../pages/punishmentSuspendedUntil'
import { forceDateInput } from '../componentDrivers/dateInput'

const testData = new TestData()
context('Punishment - when is it suspended until?', () => {
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
      cy.visit(adjudicationUrls.punishmentSuspendedUntil.urls.start('100'))
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      punishmentSuspendedUntilPage.submitButton().should('exist')
      punishmentSuspendedUntilPage.cancelButton().should('exist')
      punishmentSuspendedUntilPage.suspendedUntil().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentSuspendedUntil.urls.start('100'))
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      punishmentSuspendedUntilPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no suspended date is entered selected', () => {
      cy.visit(adjudicationUrls.punishmentSuspendedUntil.urls.start('100'))
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      punishmentSuspendedUntilPage.submitButton().click()
      punishmentSuspendedUntilPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the date the punishment is suspended until')
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it('should go to correct page when suspended', () => {
      cy.visit(adjudicationUrls.punishmentSuspendedUntil.urls.start('100'))
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')
      punishmentSuspendedUntilPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
})
