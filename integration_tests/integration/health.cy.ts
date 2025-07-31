context('Health check', () => {
  describe('Healthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthPing')
      cy.task('stubAlertPing')
      cy.task('stubCuriousPing')
      cy.task('stubDataInsightsPing')
      cy.task('stubManageUsersApiPing')
      cy.task('stubTokenPing')
      cy.task('stubPrisonerSearchPing')
      cy.task('stubPrisonApiPing')
      cy.task('stubAdjudicationsPing')
      cy.task('stubLocationsInsidePrisonApiPing')
      cy.task('stubNomisSyncPrisonerMappingApiPing')
      cy.task('stubFEComponentsAPIPing')
    })

    it('Health check page is visible and returning UP', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).its('body.status').should('equal', 'UP')
    })

    it('All dependant APIs are UP', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).then(response => {
        expect(response.body.components.hmppsAuth.status).to.eq('UP')
        expect(response.body.components.hmppsManageUsers.status).to.eq('UP')
        expect(response.body.components.locationsInsidePrison.status).to.eq('UP')
        expect(response.body.components.nomisSyncPrisonerMapping.status).to.eq('UP')
        expect(response.body.components.alert.status).to.eq('UP')
        expect(response.body.components.prison.status).to.eq('UP')
        expect(response.body.components.dataInsights.status).to.eq('UP')
        expect(response.body.components.prisonerSearch.status).to.eq('UP')
        expect(response.body.components.adjudications.status).to.eq('UP')
        expect(response.body.components.curious.status).to.eq('UP')
        expect(response.body.components.tokenVerification.status).to.eq('UP')
        expect(response.body.components.frontendComponents.status).to.eq('UP')
      })
    })

    it('Ping is visible and UP', () => {
      cy.request('/ping').its('body.status').should('equal', 'UP')
    })

    it('Info is visible', () => {
      cy.request('/info').its('body.productId').should('equal', 'DPS001')
    })
  })

  describe('Unhealthy', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubAuthPing', 500)
      cy.task('stubAlertPing', 500)
      cy.task('stubCuriousPing', 500)
      cy.task('stubDataInsightsPing', 500)
      cy.task('stubManageUsersApiPing', 500)
      cy.task('stubTokenPing', 500)
      cy.task('stubPrisonerSearchPing', 500)
      cy.task('stubPrisonApiPing', 500)
      cy.task('stubAdjudicationsPing', 500)
      cy.task('stubLocationsInsidePrisonApiPing', 500)
      cy.task('stubNomisSyncPrisonerMappingApiPing', 500)
      cy.task('stubFEComponentsAPIPing', 500)
    })

    it('Health check page is visible and returning DOWN', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).its('body.status').should('equal', 'DOWN')
    })

    it('All dependant APIs are DOWN', () => {
      cy.request({ url: '/health', method: 'GET', failOnStatusCode: false }).then(response => {
        expect(response.body.components.hmppsAuth.status).to.eq('DOWN')
        expect(response.body.components.hmppsManageUsers.status).to.eq('DOWN')
        expect(response.body.components.locationsInsidePrison.status).to.eq('DOWN')
        expect(response.body.components.nomisSyncPrisonerMapping.status).to.eq('DOWN')
        expect(response.body.components.alert.status).to.eq('DOWN')
        expect(response.body.components.prison.status).to.eq('DOWN')
        expect(response.body.components.dataInsights.status).to.eq('DOWN')
        expect(response.body.components.prisonerSearch.status).to.eq('DOWN')
        expect(response.body.components.adjudications.status).to.eq('DOWN')
        expect(response.body.components.curious.status).to.eq('DOWN')
        expect(response.body.components.tokenVerification.status).to.eq('DOWN')
        expect(response.body.components.frontendComponents.status).to.eq('DOWN')
      })
    })

    it('Ping is visible and UP', () => {
      cy.request('/ping').its('body.status').should('equal', 'UP')
    })

    it('Info is visible', () => {
      cy.request('/info').its('body.productId').should('equal', 'DPS001')
    })
  })
})
