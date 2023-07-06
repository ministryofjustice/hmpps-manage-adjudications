import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import WillPunishmentBeSuspendedPage from '../pages/willPunishmentBeSuspended'
import { forceDateInput } from '../componentDrivers/dateInput'

const testData = new TestData()
context('Will this punishment be suspended?', () => {
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
      cy.visit(adjudicationUrls.isPunishmentSuspended.urls.start(100))
      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.submitButton().should('exist')
      willPunishmentBeSuspendedPage.cancelButton().should('exist')
      willPunishmentBeSuspendedPage.suspended().should('exist')
    })
    it('should ask for suspended until date if suspended is yes ', () => {
      cy.visit(adjudicationUrls.isPunishmentSuspended.urls.start(100))
      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.suspended().find('input[value="yes"]').check()
      willPunishmentBeSuspendedPage.suspendedUntil().should('exist')
    })
    it('should not ask for suspended until date if suspended is no ', () => {
      cy.visit(adjudicationUrls.isPunishmentSuspended.urls.start(100))
      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.suspended().find('input[value="no"]').check()
      willPunishmentBeSuspendedPage.suspendedUntil().should('not.exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.isPunishmentSuspended.urls.start(100))
      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified(100))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no suspended option selected', () => {
      cy.visit(adjudicationUrls.isPunishmentSuspended.urls.start(100))
      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.submitButton().click()
      willPunishmentBeSuspendedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select yes if this punishment is to be suspended')
        })
    })
    it('should error when suspended and no date selected', () => {
      cy.visit(adjudicationUrls.isPunishmentSuspended.urls.start(100))
      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.suspended().find('input[value="yes"]').check()
      willPunishmentBeSuspendedPage.submitButton().click()

      willPunishmentBeSuspendedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the date the punishment is suspended until')
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it(' the page redirects if the user selects no', () => {
      cy.visit(adjudicationUrls.isPunishmentSuspended.urls.start(100))
      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.suspended().find('input[value="no"]').check()
      willPunishmentBeSuspendedPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isPunishmentConsecutive.urls.start(100))
      })
    })
    it('the page redirects to the award punishments page if the user selects yes', () => {
      cy.visit(adjudicationUrls.isPunishmentSuspended.urls.start(100))
      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.suspended().find('input[value="yes"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')
      willPunishmentBeSuspendedPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified(100))
      })
    })
  })
})
