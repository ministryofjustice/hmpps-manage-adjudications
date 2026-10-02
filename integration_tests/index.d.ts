declare namespace Cypress {
  interface Chainable {
    /**   * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.signIn({ failOnStatusCode: boolean })
     */
    signIn<S = unknown>(options?: { failOnStatusCode: false }): Chainable<S>

    /**
     * Asserts on the audit events sent to HMPPS Audit so far for one page
     */
    verifyAuditEvents(pageUrl: string, events: object[]): Chainable<unknown>
  }
}
