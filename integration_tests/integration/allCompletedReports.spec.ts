import AllCompletedReportsPage from '../pages/allCompletedReports'
import Page from '../pages/page'
import { generateRange } from '../../server/utils/utils'
import { ReportedAdjudication } from '../../server/data/ReportedAdjudicationResult'

context('All Completed Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.signIn()
  })
  it('should say when there are no results', () => {
    cy.task('stubGetAllReportedAdjudications', {})
    cy.task('stubGetBatchPrisonerDetails')

    cy.visit(`/all-completed-reports/`)
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)

    allCompletedReportsPage.noResultsMessage().should('exist')
  })

  it('pagination should work', () => {
    cy.task('stubGetUserFromUsername', {
      username: 'TEST_GEN',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'TEST_GEN',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 300, _ => {
      return {
        adjudicationNumber: _,
        prisonerNumber: 'A1234AA',
        bookingId: 1,
        createdByUserId: 'TEST_GEN',
        dateTimeReportExpires: null,
        incidentDetails: {
          locationId: 1,
          dateTimeOfIncident: '2021-11-15T11:30:00',
        },
        incidentStatement: null,
      }
    })
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: manyReportedAdjudications }) // Page 1
    cy.task('stubGetAllReportedAdjudications', { number: 9, allContent: manyReportedAdjudications }) // Page 10
    cy.task('stubGetAllReportedAdjudications', { number: 13, allContent: manyReportedAdjudications }) // Page 14
    cy.task('stubGetAllReportedAdjudications', { number: 14, allContent: manyReportedAdjudications }) // Page 15
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    // Page 1
    cy.visit(`/all-completed-reports`)
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    allCompletedReportsPage.previousLink().should('not.exist')
    allCompletedReportsPage.nextLink().should('exist')
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 20 of 300 results')
    allCompletedReportsPage.paginationLink(1).should('not.exist')
    allCompletedReportsPage.paginationLink(10).should('exist')
    allCompletedReportsPage.paginationLink(11).should('not.exist')
    // Page 10 - First
    allCompletedReportsPage.paginationLink(10).click()
    allCompletedReportsPage.previousLink().should('exist')
    allCompletedReportsPage.nextLink().should('exist')
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 181 to 200 of 300 results')
    allCompletedReportsPage.paginationLink(10).should('not.exist')
    allCompletedReportsPage.paginationLink(4).should('not.exist')
    allCompletedReportsPage.paginationLink(5).should('exist')
    allCompletedReportsPage.paginationLink(14).should('exist')
    allCompletedReportsPage.paginationLink(15).should('not.exist')
    // Page 14
    allCompletedReportsPage.paginationLink(14).click()
    allCompletedReportsPage.previousLink().should('exist')
    allCompletedReportsPage.nextLink().should('exist')
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 261 to 280 of 300 results')
    allCompletedReportsPage.paginationLink(14).should('not.exist')
    allCompletedReportsPage.paginationLink(5).should('not.exist')
    allCompletedReportsPage.paginationLink(6).should('exist')
    allCompletedReportsPage.paginationLink(15).should('exist')
    allCompletedReportsPage.paginationLink(16).should('not.exist')
    // Page 15 - Last
    allCompletedReportsPage.paginationLink(15).click()
    allCompletedReportsPage.previousLink().should('exist')
    allCompletedReportsPage.nextLink().should('not.exist')
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 281 to 300 of 300 results')
    allCompletedReportsPage.paginationLink(15).should('not.exist')
    allCompletedReportsPage.paginationLink(5).should('not.exist')
    allCompletedReportsPage.paginationLink(6).should('exist')
    allCompletedReportsPage.paginationLink(15).should('not.exist')
    allCompletedReportsPage.paginationLink(16).should('not.exist')
  })
})
