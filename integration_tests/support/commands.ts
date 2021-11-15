Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request(`/place-a-prisoner-on-report`)
  cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
