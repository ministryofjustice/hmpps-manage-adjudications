import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import DataInsightsPage from '../pages/dataInsights'

context('Adjudication data', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetDataInsightsChart', {
      id: 123,
      response: {
        agencyId: 100,
        data: { year: 2023 },
      },
    })
    cy.signIn()
  })

  it('should contain the required page elements on /data-insights', () => {
    cy.visit(adjudicationUrls.dataInsights.urls.start())
    const page: DataInsightsPage = Page.verifyOnPage(DataInsightsPage)
    page.checkOnPage()
  })

  it('should contain the required page elements /data-insights/totals-adjudications-and-locations', () => {
    cy.visit(adjudicationUrls.dataInsights.urls.totalsAdjudicationsAndLocations())
    const page: DataInsightsPage = Page.verifyOnPage(DataInsightsPage)
    page.checkOnPage()
    page.checkChartTitle('Total adjudications - over 24 months')
    page.checkChartTitle('Total adjudications referred to independent adjudicator - over 24 months')
  })

  it('should contain the required page elements /data-insights/protected-characteristics-and-vulnerabilities', () => {
    cy.visit(adjudicationUrls.dataInsights.urls.protectedCharacteristicsAndVulnerabilities())
    const page: DataInsightsPage = Page.verifyOnPage(DataInsightsPage)
    page.checkOnPage()
  })

  it('should contain the required page elements /data-insights/offence-type', () => {
    cy.visit(adjudicationUrls.dataInsights.urls.offenceType())
    const page: DataInsightsPage = Page.verifyOnPage(DataInsightsPage)
    page.checkOnPage()
  })

  it('should contain the required page elements /data-insights/punishments', () => {
    cy.visit(adjudicationUrls.dataInsights.urls.punishments())
    const page: DataInsightsPage = Page.verifyOnPage(DataInsightsPage)
    page.checkOnPage()
  })

  it('should contain the required page elements /data-insights/pleas-and-findings', () => {
    cy.visit(adjudicationUrls.dataInsights.urls.pleasAndFindings())
    const page: DataInsightsPage = Page.verifyOnPage(DataInsightsPage)
    page.checkOnPage()
  })
})
