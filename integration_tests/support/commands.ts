Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request(`/place-a-prisoner-on-report`)
  cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('verifyAuditEvents', (pageUrl: string, events: object[]) => {
  return cy.task('getSentAuditEvents', { pageUrl, expectedCount: events.length }).should('deep.equal', events)
})
