import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import DataInsightsPage from '../pages/dataInsights'
import { ChartDetailsResult } from '../../server/services/ChartDetailsResult'

context('Adjudication data', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    const chartEntries = [
      {
        month: 7,
        year_curr: 2022,
        count_curr: 77,
        year_prev: 2021,
        count_prev: 41,
      },
      {
        month: 8,
        year_curr: 2022,
        count_curr: 65,
        year_prev: 2021,
        count_prev: 86,
      },
      {
        month: 9,
        year_curr: 2022,
        count_curr: 23,
        year_prev: 2021,
        count_prev: 26,
      },
      {
        month: 10,
        year_curr: 2022,
        count_curr: 71,
        year_prev: 2021,
        count_prev: 64,
      },
      {
        month: 11,
        year_curr: 2022,
        count_curr: 27,
        year_prev: 2021,
        count_prev: 36,
      },
      {
        month: 12,
        year_curr: 2022,
        count_curr: 82,
        year_prev: 2021,
        count_prev: 63,
      },
      {
        month: 1,
        year_curr: 2023,
        count_curr: 23,
        year_prev: 2022,
        count_prev: 95,
      },
      {
        month: 2,
        year_curr: 2023,
        count_curr: 27,
        year_prev: 2022,
        count_prev: 3,
      },
      {
        month: 3,
        year_curr: 2023,
        count_curr: 50,
        year_prev: 2022,
        count_prev: 15,
      },
      {
        month: 4,
        year_curr: 2023,
        count_curr: 70,
        year_prev: 2022,
        count_prev: 38,
      },
      {
        month: 5,
        year_curr: 2023,
        count_curr: 15,
        year_prev: 2022,
        count_prev: 10,
      },
      {
        month: 6,
        year_curr: 2023,
        count_curr: 32,
        year_prev: 2022,
        count_prev: 44,
      },
    ]
    cy.task('stubGetDataInsightsChart', {
      agencyId: 'MDI',
      chartName: '1a',
      response: {
        agencyId: 'MDI',
        chartName: '1a',
        chartEntries,
      } as ChartDetailsResult,
    })
    cy.task('stubGetDataInsightsChart', {
      agencyId: 'BCI',
      chartName: '1b',
      response: {
        agencyId: 'BCI',
        chartName: '1b',
        chartEntries,
      } as ChartDetailsResult,
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
