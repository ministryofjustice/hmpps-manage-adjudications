import moment from 'moment'
import AllCompletedReportsPage from '../pages/allCompletedReports'
import Page from '../pages/page'
import { generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AdjudicationsFilter from '../pages/adjudicationsFilter'
import YourCompletedReportsPage from '../pages/yourCompletedReports'

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

    cy.visit(adjudicationUrls.allCompletedReports.root)
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)

    allCompletedReportsPage.noResultsMessage().should('exist')
  })

  it('should display the correct data on the first page', () => {
    cy.task('stubGetAllReportedAdjudications', {})
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
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 20, _ => {
      return {
        adjudicationNumber: _,
        prisonerNumber: 'A1234AA',
        bookingId: 1,
        createdByUserId: 'TEST_GEN',
        incidentDetails: {
          locationId: 1,
          dateTimeOfIncident: '2021-11-15T11:30:00',
          handoverDeadline: '2021-11-17T11:30:00',
        },
        isYouthOffender: false,
        incidentStatement: null,
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        incidentRole: undefined,
        offenceDetails: undefined,
        createdDateTime: '2021-11-15T14:30:00',
      }
    })
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: manyReportedAdjudications }) // Page 1
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])

    cy.visit(adjudicationUrls.allCompletedReports.root)
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    allCompletedReportsPage.resultsTable().should('exist')
    allCompletedReportsPage
      .resultsTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Prisoner’s name')
        expect($headings.get(1).innerText).to.contain('Prison number')
        expect($headings.get(2).innerText).to.contain('Date and time of incident')
        expect($headings.get(3).innerText).to.contain('Reporting officer')
        expect($headings.get(4).innerText).to.contain('Status')
      })
    allCompletedReportsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Potter, Harry')
        expect($data.get(1).innerText).to.contain('A1234AA')
        expect($data.get(2).innerText).to.contain('15 November 2021 - 11:30')
        expect($data.get(3).innerText).to.contain('Test User')
        expect($data.get(4).innerText).to.contain('Awaiting review')
        expect($data.get(5).innerText).to.contain('View report')
      })
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
        incidentDetails: {
          locationId: 1,
          dateTimeOfIncident: '2021-11-15T11:30:00',
          handoverDeadline: '2021-11-17T11:30:00',
        },
        isYouthOffender: false,
        incidentStatement: null,
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        incidentRole: undefined,
        offenceDetails: undefined,
        createdDateTime: '2021-11-15T14:30:00',
      }
    })
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: manyReportedAdjudications }) // Page 1
    cy.task('stubGetAllReportedAdjudications', { number: 9, allContent: manyReportedAdjudications }) // Page 10
    cy.task('stubGetAllReportedAdjudications', { number: 13, allContent: manyReportedAdjudications }) // Page 14
    cy.task('stubGetAllReportedAdjudications', { number: 14, allContent: manyReportedAdjudications }) // Page 15
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    // Page 1
    cy.visit(adjudicationUrls.allCompletedReports.root)
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

  it('filtering should work', () => {
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
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: [] })
    // The result to return when filtering for the dates we will enter in the date picker and status selected.
    cy.task('stubGetAllReportedAdjudications', {
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
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])
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

    cy.visit(adjudicationUrls.allCompletedReports.root) // visit page one
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    allCompletedReportsPage
      .noResultsMessage()
      .should('contain', 'There are no results for the details you have entered')
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    adjudicationsFilter.forceFromDate(1, 1, 2022)
    adjudicationsFilter.forceToDate(9, 1, 2022)
    adjudicationsFilter.selectStatus().select('ACCEPTED')
    adjudicationsFilter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=01%2F01%2F2022&toDate=09%2F01%2F2022&status=ACCEPTED')
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 1 of 1 results')
  })

  it('filtering and pagination should work together', () => {
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
        incidentDetails: {
          locationId: 1,
          dateTimeOfIncident: '2021-10-10T11:30:00',
          handoverDeadline: '2021-10-12T11:30:00',
        },
        isYouthOffender: false,
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
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: [] })
    // The results to return when initially filtering
    cy.task('stubGetAllReportedAdjudications', {
      number: 0, // Page 1
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.ACCEPTED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    // The results to return after going to another page after having filtered previously
    cy.task('stubGetAllReportedAdjudications', {
      number: 1, // Page 2
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.ACCEPTED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])
    cy.visit(adjudicationUrls.allCompletedReports.root) // visit page one
    const allCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    adjudicationsFilter.forceFromDate(10, 10, 2021)
    adjudicationsFilter.forceToDate(19, 10, 2021)
    adjudicationsFilter.selectStatus().select('ACCEPTED')
    adjudicationsFilter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=ACCEPTED')
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 20 of 300 results')
    allCompletedReportsPage.paginationLink(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      // We expect the initial filter parameters to have been passed through on the links.
      expect(loc.search).to.eq('?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=ACCEPTED&pageNumber=2')
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 21 to 40 of 300 results')
  })

  it('date range validation works', () => {
    cy.task('stubGetAllReportedAdjudications', {})
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.allCompletedReports.root)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    adjudicationsFilter.forceFromDate(19, 10, 2021)
    adjudicationsFilter.forceToDate(10, 10, 2021)
    adjudicationsFilter.applyButton().click()
    adjudicationsFilter.filterBar().should('contain.text', 'Enter a date that is before or the same as the ‘date to’')
  })

  it('default date range is as expected', () => {
    cy.task('stubGetAllReportedAdjudications', {})
    cy.task('stubGetBatchPrisonerDetails')

    cy.visit(adjudicationUrls.allCompletedReports.root)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    adjudicationsFilter.toDateInput().should('have.value', moment().format('DD/MM/YYYY'))
    adjudicationsFilter.fromDateInput().should('have.value', moment().subtract(2, 'days').format('DD/MM/YYYY'))
  })
})
