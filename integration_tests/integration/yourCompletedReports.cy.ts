import moment from 'moment'
import YourCompletedReportsPage from '../pages/yourCompletedReports'
import Page from '../pages/page'
import { formatDateForDatePicker, generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AdjudicationsFilter from '../pages/adjudicationsFilter'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

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
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2022-01-01T11:30:00',
      })
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
    yourCompletedReportsPage.paginationLink(10).first().click()
    yourCompletedReportsPage.previousLink().should('exist')
    yourCompletedReportsPage.nextLink().should('exist')
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 181 to 200 of 300 results')
    yourCompletedReportsPage.paginationLink(10).should('not.exist')
    yourCompletedReportsPage.paginationLink(4).should('not.exist')
    yourCompletedReportsPage.paginationLink(5).should('exist')
    yourCompletedReportsPage.paginationLink(14).should('exist')
    yourCompletedReportsPage.paginationLink(15).should('not.exist')
    // Page 14
    yourCompletedReportsPage.paginationLink(14).first().click()
    yourCompletedReportsPage.previousLink().should('exist')
    yourCompletedReportsPage.nextLink().should('exist')
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 261 to 280 of 300 results')
    yourCompletedReportsPage.paginationLink(14).should('not.exist')
    yourCompletedReportsPage.paginationLink(5).should('not.exist')
    yourCompletedReportsPage.paginationLink(6).should('exist')
    yourCompletedReportsPage.paginationLink(15).should('exist')
    yourCompletedReportsPage.paginationLink(16).should('not.exist')
    // Page 15 - Last
    yourCompletedReportsPage.paginationLink(15).first().click()
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
        testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2022-01-01T11:30:00',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
        }),
      ],
      filter: { status: ReportedAdjudicationStatus.UNSCHEDULED, fromDate: '2022-01-01', toDate: '2022-01-09' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    cy.visit(adjudicationUrls.yourCompletedReports.root) // visit page one
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)
    yourCompletedReportsPage
      .noResultsMessage()
      .should('contain', 'No adjudications have been found for the selected filters.')
    const filterAdjudication: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('1/1/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('1/9/2022').toISOString(), 'short')
    filterAdjudication.fromDateInput().clear().type(fromDate)
    filterAdjudication.toDateInput().clear().type(toDate)
    filterAdjudication.checkCheckboxWithValue('UNSCHEDULED')
    yourCompletedReportsPage.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=01%2F01%2F2022&toDate=09%2F01%2F2022&status=UNSCHEDULED')
    })
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 1 of 1 results')
  })

  it('Should deal with some prisoner information missing', () => {
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetYourReportedAdjudications', { number: 0, allContent: [] })
    // The result to return when filtering for the dates we will enter in the date picker and status selected.
    cy.task('stubGetYourReportedAdjudications', {
      number: 0,
      allContent: [
        testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2022-01-01T11:30:00',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
        }),
      ],
      filter: { status: ReportedAdjudicationStatus.UNSCHEDULED, fromDate: '2022-01-01', toDate: '2022-01-09' },
    })
    cy.task('stubGetBatchPrisonerDetails', [])
    cy.visit(adjudicationUrls.yourCompletedReports.root) // visit page one
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)
    yourCompletedReportsPage
      .noResultsMessage()
      .should('contain', 'No adjudications have been found for the selected filters.')
    const filterAdjudication: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('1/1/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('1/9/2022').toISOString(), 'short')
    filterAdjudication.fromDateInput().clear().type(fromDate)
    filterAdjudication.toDateInput().clear().type(toDate)
    filterAdjudication.checkCheckboxWithValue('UNSCHEDULED')
    yourCompletedReportsPage.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=01%2F01%2F2022&toDate=09%2F01%2F2022&status=UNSCHEDULED')
    })
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 1 of 1 results')
    yourCompletedReportsPage.dateOfDiscovery().should('have.text', 'Incident discovered: 01/01/2022 - 11:30')
    yourCompletedReportsPage.dateOfSubmission().should('have.text', 'Report submitted: 09/12/2022 - 10:30')
    yourCompletedReportsPage.viewReportLink().should('have.text', '1')
    yourCompletedReportsPage.prisonerNameAndNumber().should('contain', 'Unknown - A1234AA')
    yourCompletedReportsPage.status().should('contain', 'Unscheduled')
  })

  it('filtering and pagination should work together', () => {
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 300, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-10-10T11:30:00',
        dateTimeOfDiscovery: '2022-01-01T11:30:00',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
      })
    })
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetYourReportedAdjudications', { number: 0, allContent: [] })
    // The results to return when initially filtering
    cy.task('stubGetYourReportedAdjudications', {
      number: 0, // Page 1
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.UNSCHEDULED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    // The results to return after going to another page after having filtered previously
    cy.task('stubGetYourReportedAdjudications', {
      number: 1, // Page 2
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.UNSCHEDULED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'JAMES', lastName: 'MORIARTY' }])
    cy.visit(adjudicationUrls.yourCompletedReports.root) // visit page one
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('10/10/2021').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('10/19/2021').toISOString(), 'short')
    adjudicationsFilter.fromDateInput().clear().type(fromDate)
    adjudicationsFilter.toDateInput().clear().type(toDate)
    adjudicationsFilter.checkCheckboxWithValue('UNSCHEDULED')
    yourCompletedReportsPage.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=UNSCHEDULED')
    })
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 20 of 300 results')
    yourCompletedReportsPage.paginationLink(2).first().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
      // We expect the initial filter parameters to have been passed through on the links.
      expect(loc.search).to.eq('?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=UNSCHEDULED&pageNumber=2')
    })
    yourCompletedReportsPage.paginationResults().should('have.text', 'Showing 21 to 40 of 300 results')
  })

  it('date range validation works', () => {
    cy.task('stubGetYourReportedAdjudications', {})
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.yourCompletedReports.root)
    const yourCompletedReportsPage: YourCompletedReportsPage = Page.verifyOnPage(YourCompletedReportsPage)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('10/19/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('10/10/2022').toISOString(), 'short')
    adjudicationsFilter.fromDateInput().clear().type(fromDate)
    adjudicationsFilter.toDateInput().clear().type(toDate)
    yourCompletedReportsPage.applyButton().click()
    cy.get('.govuk-error-summary').should('contain.text', 'Enter a date that is before or the same as the ‘date to’')
  })

  it('default date range is as expected', () => {
    cy.task('stubGetYourReportedAdjudications', {})
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.yourCompletedReports.root)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    adjudicationsFilter.toDateInput().should('have.value', moment().format('DD/MM/YYYY'))
    adjudicationsFilter.fromDateInput().should('have.value', moment().subtract(2, 'days').format('DD/MM/YYYY'))
  })
})
