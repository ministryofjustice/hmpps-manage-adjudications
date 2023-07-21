import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ManualEntryConsecutivePunishmentPage from '../pages/manualEntryConsecutivePunishment'

const testData = new TestData()
context('Which charge will it be consecutive to?', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubValidateChargeNumber', {
      adjudicationNumber: 100,
      sanctionStatus: 'IMMEDIATE',
      offenderNo: 'G6123VU',
    })
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          prisonerNumber: 'G6123VU',
          adjudicationNumber: 100,
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(100))
      const manualEntryConsecutivePunishmentPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentPage)
      manualEntryConsecutivePunishmentPage.submitButton().should('exist')
      manualEntryConsecutivePunishmentPage.cancelButton().should('exist')
      manualEntryConsecutivePunishmentPage.chargeNumber().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(100))
      const manualEntryConsecutivePunishmentPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentPage)
      manualEntryConsecutivePunishmentPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified(100))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no charge number is entered', () => {
      cy.visit(adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(100))
      const manualEntryConsecutivePunishmentPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentPage)
      manualEntryConsecutivePunishmentPage.submitButton().click()

      manualEntryConsecutivePunishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter a charge number')
        })
    })
    it('should error when input is not numerical', () => {
      cy.visit(adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(100))
      const manualEntryConsecutivePunishmentPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentPage)
      manualEntryConsecutivePunishmentPage.chargeNumber().type('lssdsds')
      manualEntryConsecutivePunishmentPage.submitButton().click()

      manualEntryConsecutivePunishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Charge number must only include numbers')
        })
    })
    it('should error when input is not 7 numbers long', () => {
      cy.visit(adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(100))
      const manualEntryConsecutivePunishmentPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentPage)
      manualEntryConsecutivePunishmentPage.chargeNumber().type('1234')
      manualEntryConsecutivePunishmentPage.submitButton().click()

      manualEntryConsecutivePunishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Charge number must be 7 numbers long')
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it('should redirect when days are entered correctly', () => {
      cy.visit(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(100)}?punishmentType=ADDITIONAL_DAYS`
      )
      const manualEntryConsecutivePunishmentPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentPage)
      manualEntryConsecutivePunishmentPage.chargeNumber().type('1234567')
      manualEntryConsecutivePunishmentPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified(100))
      })
    })
  })
})
