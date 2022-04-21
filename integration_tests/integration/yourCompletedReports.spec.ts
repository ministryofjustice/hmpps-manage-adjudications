import YourCompletedReportsPage from '../pages/yourCompletedReports'
import Page from '../pages/page'
import { generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'

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
    cy.visit(adjudicationUrls.yourCompletedReports.root)
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)

    yourCompletedReportsPage.noResultsMessage().should('exist')
  })

  it('pagination should work', () => {
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 300, _ => {
      return {
        adjudicationNumber: _,
        prisonerNumber: 'A1234AA',
        bookingId: 1,
        incidentDetails: {
          locationId: 1,
          dateTimeOfIncident: '2021-11-15T11:30:00',
          handoverDeadline: '2021-11-17T11:30:00',
        },
        incidentStatement: null,
        createdByUserId: 'TEST_GEN',
        createdDateTime: undefined,
        incidentRole: {
          associatedPrisonersNumber: undefined,
          roleCode: undefined,
        },
        offenceDetails: undefined,
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
      }
    })
    cy.task('stubGetYourReportedAdjudications', { number: 0, allContent: manyReportedAdjudications }) // Page 1
    cy.task('stubGetYourReportedAdjudications', { number: 9, allContent: manyReportedAdjudications }) // Page 10
    cy.task('stubGetYourReportedAdjudications', { number: 13, allContent: manyReportedAdjudications }) // Page 14
    cy.task('stubGetYourReportedAdjudications', { number: 14, allContent: manyReportedAdjudications }) // Page 15
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    // Page 1
    cy.visit(adjudicationUrls.yourCompletedReports.root)
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

  it('filtering should work', () => {
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetYourReportedAdjudications', { number: 0, allContent: [] })
    // The result to return when filtering for the dates we will enter in the date picker and status selected.
    cy.task('stubGetYourReportedAdjudications', {
      number: 0,
      allContent: [
        {
          adjudicationNumber: 1,
          prisonerNumber: 'A1234AA',
          bookingId: 1,
          incidentDetails: {
            locationId: 1,
            dateTimeOfIncident: '2021-01-01T11:30:00',
            handoverDeadline: '2021-01-03T11:30:00',
          },
          incidentStatement: null,
          createdByUserId: 'TEST_GEN',
          createdDateTime: undefined,
          incidentRole: {
            associatedPrisonersNumber: undefined,
            roleCode: undefined,
          },
          offenceDetails: undefined,
          status: ReportedAdjudicationStatus.ACCEPTED,
        },
      ],
      filter: { status: ReportedAdjudicationStatus.ACCEPTED, toDate: '2022-01-09', fromDate: '2022-01-01' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    cy.visit(adjudicationUrls.yourCompletedReports.root) // visit page one
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)
    yourCompletedReportsPage
      .noResultsMessage()
      .should('contain', 'There are no results for the details you have entered')
    yourCompletedReportsPage.forceFromDate(1, 1, 2022)
    yourCompletedReportsPage.forceToDate(9, 1, 2022)
    yourCompletedReportsPage.selectStatus().select('ACCEPTED')
    yourCompletedReportsPage.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=01%2F01%2F2022&toDate=09%2F01%2F2022&status=ACCEPTED')
    })
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 1 of 1 results')
  })
})
