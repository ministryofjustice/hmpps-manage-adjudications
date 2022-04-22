import YourCompletedReportsPage from '../pages/yourCompletedReports'
import Page from '../pages/page'
import { generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import FilterAdjudications from '../pages/filterAdjudications'

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
            dateTimeOfIncident: '2022-01-01T11:30:00',
            handoverDeadline: '2022-01-03T11:30:00',
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
      filter: { status: ReportedAdjudicationStatus.ACCEPTED, fromDate: '2022-01-01', toDate: '2022-01-09' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    cy.visit(adjudicationUrls.yourCompletedReports.root) // visit page one
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)
    yourCompletedReportsPage
      .noResultsMessage()
      .should('contain', 'There are no results for the details you have entered')
    const filterAdjudication: FilterAdjudications = new FilterAdjudications()
    filterAdjudication.forceFromDate(1, 1, 2022)
    filterAdjudication.forceToDate(9, 1, 2022)
    filterAdjudication.selectStatus().select('ACCEPTED')
    filterAdjudication.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=01%2F01%2F2022&toDate=09%2F01%2F2022&status=ACCEPTED')
    })
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 1 of 1 results')
  })

  it('filtering and pagination should work together', () => {
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 300, _ => {
      return {
        adjudicationNumber: _,
        prisonerNumber: 'A1234AA',
        bookingId: 1,
        incidentDetails: {
          locationId: 1,
          dateTimeOfIncident: '2021-10-10T11:30:00',
          handoverDeadline: '2021-10-12T11:30:00',
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
      }
    })
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetYourReportedAdjudications', { number: 0, allContent: [] })
    // The results to return when initially filtering
    cy.task('stubGetYourReportedAdjudications', {
      number: 0, // Page 1
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.ACCEPTED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    // The results to return after going to another page after having filtered previously
    cy.task('stubGetYourReportedAdjudications', {
      number: 1, // Page 2
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.ACCEPTED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    cy.visit(adjudicationUrls.yourCompletedReports.root) // visit page one
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)
    const filterAdjudication: FilterAdjudications = new FilterAdjudications()
    filterAdjudication.forceFromDate(10, 10, 2021)
    filterAdjudication.forceToDate(19, 10, 2021)
    filterAdjudication.selectStatus().select('ACCEPTED')
    filterAdjudication.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=ACCEPTED')
    })
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 20 of 300 results')
    yourCompletedReportsPage.paginationLink(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
      // We expect the initial filter parameters to have been passed through on the links.
      expect(loc.search).to.eq('?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=ACCEPTED&pageNumber=2')
    })
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 21 to 40 of 300 results')
  })
})
