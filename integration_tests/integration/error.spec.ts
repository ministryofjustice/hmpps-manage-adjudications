import ErrorPage from '../pages/error'

context('Error page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('Error page displays as expected', () => {
    cy.visit('/unknown', { failOnStatusCode: false })
    const errorPage = new ErrorPage('Not found')
    errorPage.continue().should('exist').should('have.attr', 'href').and('include', '/unknown')
  })
})
