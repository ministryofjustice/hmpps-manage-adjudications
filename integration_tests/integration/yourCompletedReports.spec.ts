import YourCompletedReportsPage from '../pages/yourCompletedReports'
import Page from '../pages/page'

context('Your Completed Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })
  it('should say when there are no results', () => {
    cy.task('stubGetYourReportedAdjudications', {})
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(`/your-completed-reports/`)
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)

    yourCompletedReportsPage.noResultsMessage().should('exist')
  })
})
