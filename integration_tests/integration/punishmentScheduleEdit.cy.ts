import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentSchedulePage from '../pages/punishmentSchedule'

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
      cy.visit(adjudicationUrls.punishmentSchedule.urls.edit(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.submitButton().should('exist')
      punishmentSchedulePage.cancelButton().should('exist')
      punishmentSchedulePage.days().should('exist')
      punishmentSchedulePage.suspended().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentSchedule.urls.edit(100))
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      })
    })
  })
})
