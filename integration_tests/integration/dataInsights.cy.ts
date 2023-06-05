import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import DataInsightsPage from '../pages/dataInsights'

context('Adjudication data', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.dataInsights.root)
    const dataInsightsPage: DataInsightsPage = Page.verifyOnPage(DataInsightsPage)
    dataInsightsPage.checkOnPage()
  })
})
