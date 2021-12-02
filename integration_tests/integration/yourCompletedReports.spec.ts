import YourCompletedReportsPage from '../pages/yourCompletedReports'
import Page from '../pages/page'
import { generateRange } from '../../server/utils/utils'
import { ReportedAdjudication } from '../../server/data/ReportedAdjudicationResult'

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

  it('pagination should work', () => {
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 300, _ => {
      return {
        adjudicationNumber: _,
        prisonerNumber: 'A1234AA',
        bookingId: 1,
        dateTimeReportExpires: null,
        incidentDetails: {
          locationId: 1,
          dateTimeOfIncident: '2021-11-15T11:30:00',
        },
        incidentStatement: null,
        createdByUserId: 'TEST_GEN',
      }
    })
    cy.task('stubGetYourReportedAdjudications', { number: 0, allContent: manyReportedAdjudications }) // Page 1
    cy.task('stubGetYourReportedAdjudications', { number: 9, allContent: manyReportedAdjudications }) // Page 10
    cy.task('stubGetYourReportedAdjudications', { number: 13, allContent: manyReportedAdjudications }) // Page 14
    cy.task('stubGetYourReportedAdjudications', { number: 14, allContent: manyReportedAdjudications }) // Page 15
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    // Page 1
    cy.visit(`/your-completed-reports/`)
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)
    yourCompletedReportsPage.previousLink().should('not.exist')
    yourCompletedReportsPage.nextLink().should('exist')
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 20 of 300 results')
    yourCompletedReportsPage.paginationLink(1).should('not.exist')
    yourCompletedReportsPage.paginationLink(10).should('exist')
    yourCompletedReportsPage.paginationLink(11).should('not.exist')
    // Page 10 - First
    yourCompletedReportsPage.paginationLink(10).click()
    yourCompletedReportsPage.previousLink().should('exist')
    yourCompletedReportsPage.nextLink().should('exist')
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 181 to 200 of 300 results')
    yourCompletedReportsPage.paginationLink(10).should('not.exist')
    yourCompletedReportsPage.paginationLink(4).should('not.exist')
    yourCompletedReportsPage.paginationLink(5).should('exist')
    yourCompletedReportsPage.paginationLink(14).should('exist')
    yourCompletedReportsPage.paginationLink(15).should('not.exist')
    // Page 14
    yourCompletedReportsPage.paginationLink(14).click()
    yourCompletedReportsPage.previousLink().should('exist')
    yourCompletedReportsPage.nextLink().should('exist')
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 261 to 280 of 300 results')
    yourCompletedReportsPage.paginationLink(14).should('not.exist')
    yourCompletedReportsPage.paginationLink(5).should('not.exist')
    yourCompletedReportsPage.paginationLink(6).should('exist')
    yourCompletedReportsPage.paginationLink(15).should('exist')
    yourCompletedReportsPage.paginationLink(16).should('not.exist')
    // Page 15 - Last
    yourCompletedReportsPage.paginationLink(15).click()
    yourCompletedReportsPage.previousLink().should('exist')
    yourCompletedReportsPage.nextLink().should('not.exist')
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 281 to 300 of 300 results')
    yourCompletedReportsPage.paginationLink(15).should('not.exist')
    yourCompletedReportsPage.paginationLink(5).should('not.exist')
    yourCompletedReportsPage.paginationLink(6).should('exist')
    yourCompletedReportsPage.paginationLink(15).should('not.exist')
    yourCompletedReportsPage.paginationLink(16).should('not.exist')
  })
})
