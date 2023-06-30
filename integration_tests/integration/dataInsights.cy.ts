import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import DataInsightsPage from '../pages/dataInsights'
import { ChartDetailsResult } from '../../server/services/ChartDetailsResult'

context('Adjudication data', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')

    const chartEntries1a1b = [
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
    const chartEntries1d = [
      {
        incident_loc: 'Wing A',
        count: 61.0,
        proportion: 0.2772727272727273,
        proportion_round: 0.28,
      },
      {
        incident_loc: 'Wing B',
        count: 69.0,
        proportion: 0.31363636363636366,
        proportion_round: 0.31,
      },
      {
        incident_loc: 'Wing C',
        count: 90.0,
        proportion: 0.4090909090909091,
        proportion_round: 0.41,
      },
    ]
    const chartEntries1f = [
      {
        wing_loc: 'Wing A',
        count: 91.0,
        proportion: 0.7054263565891473,
        proportion_round: 0.71,
      },
      {
        wing_loc: 'Wing B',
        count: 1.0,
        proportion: 0.007751937984496124,
        proportion_round: 0.01,
      },
      {
        wing_loc: 'Wing C',
        count: 37.0,
        proportion: 0.2868217054263566,
        proportion_round: 0.29,
      },
    ]

    const chartEntries = {
      '1a': chartEntries1a1b,
      '1b': chartEntries1a1b,
      '1d': chartEntries1d,
      '1f': chartEntries1f,
    }
    cy.task('stubGetDataInsightsChart', {
      agencyId: 'MDI',
      chartName: '1a',
      response: {
        agencyId: 'MDI',
        chartName: '1a',
        chartEntries: chartEntries['1a'],
      } as ChartDetailsResult,
    })
    cy.task('stubGetDataInsightsChart', {
      agencyId: 'MDI',
      chartName: '1b',
      response: {
        agencyId: 'MDI',
        chartName: '1b',
        chartEntries: chartEntries['1b'],
      } as ChartDetailsResult,
    })
    cy.task('stubGetDataInsightsChart', {
      agencyId: 'MDI',
      chartName: '1d',
      response: {
        agencyId: 'MDI',
        chartName: '1d',
        chartEntries: chartEntries['1d'],
      } as ChartDetailsResult,
    })
    cy.task('stubGetDataInsightsChart', {
      agencyId: 'MDI',
      chartName: '1f',
      response: {
        agencyId: 'MDI',
        chartName: '1f',
        chartEntries: chartEntries['1f'],
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
    page.checkChartTitle('Total adjudications - over 24 months (1a)')
    page.checkChartTitle('Total adjudications referred to independent adjudicator - over 24 months (1b)')
    page.checkChartTitle('Total adjudications by location of adjudication offence – last 30 days (1d)')
    page.checkChartTitle('Total adjudications by residential location of offender – last 30 days (1f)')
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
