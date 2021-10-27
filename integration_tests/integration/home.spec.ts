import Homepage from '../pages/home'
import Page from '../pages/page'

context('Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should see the feedback banner', () => {
    cy.visit(`/`)
    const homepage: Homepage = Page.verifyOnPage(Homepage)
    homepage.feedbackBanner().should('exist')
  })
})
