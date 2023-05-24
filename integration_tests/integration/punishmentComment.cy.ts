import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentCommentPage from '../pages/punishmentComment'

const testData = new TestData()
context('Add a comment about punishment', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubCreatePunishmentComment', {
      adjudicationNumber: 100,
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.add(100))
      const page = Page.verifyOnPage(PunishmentCommentPage)
      page.punishmentComment().should('exist')
      page.submitButton().should('exist')
      page.cancelButton().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.add(100))
      const page = Page.verifyOnPage(PunishmentCommentPage)
      page.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      })
    })
  })

  describe('Validation', () => {
    it('should error when punishment comment blank', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.add(100))
      const page = Page.verifyOnPage(PunishmentCommentPage)
      page.submitButton().click()

      page
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Punishment comment cannot be blank')
        })
    })
  })

  describe('Submit', () => {
    it('should submit successfully and redirect', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.add(100))
      const page = Page.verifyOnPage(PunishmentCommentPage)
      page.punishmentComment().type('some text')

      page.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      })
    })
  })
})
