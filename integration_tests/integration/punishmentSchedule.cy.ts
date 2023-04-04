import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentSchedulePage from '../pages/punishmentSchedule'
import { forceDateInput } from '../componentDrivers/dateInput'

const testData = new TestData()
context('Punishment schedule', () => {
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
      cy.visit(adjudicationUrls.punishmentSchedule.urls.start(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.submitButton().should('exist')
      punishmentSchedulePage.cancelButton().should('exist')
      punishmentSchedulePage.days().should('exist')
      punishmentSchedulePage.suspended().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentSchedule.urls.start(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no days entered', () => {
      cy.visit(adjudicationUrls.punishmentSchedule.urls.start(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.submitButton().click()

      punishmentSchedulePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter how many days the punishment will last')
        })
    })
    it('should error when no suspended option selected', () => {
      cy.visit(adjudicationUrls.punishmentSchedule.urls.start(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')

      punishmentSchedulePage.submitButton().click()

      punishmentSchedulePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select yes, if this punishment is to be suspended')
        })
    })
    it('should error when suspended and no date selected', () => {
      cy.visit(adjudicationUrls.punishmentSchedule.urls.start(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').check()
      punishmentSchedulePage.submitButton().click()

      punishmentSchedulePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the date the punishment is suspended until')
        })
    })
    it('should error when not suspended and no start date entered', () => {
      cy.visit(adjudicationUrls.punishmentSchedule.urls.start(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="no"]').check()

      punishmentSchedulePage.submitButton().click()

      punishmentSchedulePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the date this punishment will start')
        })
    })
    it('should error when not suspended and no end date entered', () => {
      cy.visit(adjudicationUrls.punishmentSchedule.urls.start(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="no"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="start-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      punishmentSchedulePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the last day of this punishment')
        })
    })
  })
})
