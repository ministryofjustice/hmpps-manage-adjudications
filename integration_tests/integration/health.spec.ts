context('Health check', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthPing')
    cy.task('stubTokenVerificationPing')
  })

  it('Health check page is visible', () => {
    cy.request('/health').its('body.healthy').should('equal', true)
  })

  it('Ping is visible and UP', () => {
    cy.request('/ping').its('body.status').should('equal', 'UP')
  })

  context('Unhealthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthPing', 500)
      cy.task('stubPrisonerSearchPing', 500)
      cy.task('stubPrisonApiPing', 500)
      cy.task('stubAdjudicationsApiPing', 500)
    })

    it('Health check page is visible', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).its('body.healthy').should('equal', false)
    })

    it('All dependant APIs are healthy', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).then(response => {
        expect(response.body.checks.hmppsAuth.status).to.eq(500)
        expect(response.body.checks.prisonerSearch.status).to.eq(500)
        expect(response.body.checks.tokenVerification.status).to.eq(500)
        expect(response.body.checks.adjudications.status).to.eq(500)
      })
    })
  })
})
