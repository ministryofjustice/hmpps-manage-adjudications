import moment from 'moment'
import AllCompletedReportsPage from '../pages/allReports'
import Page from '../pages/page'
import { formatDateForDatePicker, generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AdjudicationsFilter from '../pages/adjudicationsFilter'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

context('All Completed Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
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
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 20, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
      })
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
        expect($headings.get(0).innerText).to.contain('Charge number')
        expect($headings.get(1).innerText).to.contain('Discovery date and time')
        expect($headings.get(2).innerText).to.contain('Name and prison number')
        expect($headings.get(3).innerText).to.contain('Status')
        expect($headings.get(4).innerText).to.contain('Latest scheduled hearing')
        expect($headings.get(5) === undefined)
      })
    allCompletedReportsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('1')
        expect($data.get(1).innerText).to.contain('15 November 2345 - 11:30')
        expect($data.get(2).innerText).to.contain('Potter, Harry - A1234AA')
        expect($data.get(3).innerText).to.contain('Awaiting review')
        expect($data.get(4).innerText).to.equal('-')
        // test hearings link is not populated
        expect($data.get(5).innerText).to.equal('')
        expect($data.get(6).innerText).to.contain('View report')
      })
  })

  it('should deal with some prisoner information missing', () => {
    cy.task('stubGetAllReportedAdjudications', {})
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 20, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
      })
    })
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: manyReportedAdjudications }) // Page 1
    cy.task('stubGetBatchPrisonerDetails', [])

    cy.visit(adjudicationUrls.allCompletedReports.root)
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    allCompletedReportsPage.resultsTable().should('exist')
    allCompletedReportsPage
      .resultsTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Charge number')
        expect($headings.get(1).innerText).to.contain('Discovery date and time')
        expect($headings.get(2).innerText).to.contain('Name and prison number')
        expect($headings.get(3).innerText).to.contain('Status')
        expect($headings.get(4).innerText).to.contain('Latest scheduled hearing')
        expect($headings.get(5) === undefined)
      })
    allCompletedReportsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('1')
        expect($data.get(1).innerText).to.contain('15 November 2345 - 11:30')
        expect($data.get(2).innerText).to.contain('Unknown - A1234AA')
        expect($data.get(3).innerText).to.contain('Awaiting review')
        expect($data.get(4).innerText).to.equal('-')
        // test hearings link is not populated
        expect($data.get(5).innerText).to.equal('')
        expect($data.get(6).innerText).to.contain('View report')
      })
  })

  it('pagination should work', () => {
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 300, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
      })
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
    allCompletedReportsPage.paginationLink(10).first().click()
    allCompletedReportsPage.previousLink().should('exist')
    allCompletedReportsPage.nextLink().should('exist')
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 181 to 200 of 300 results')
    allCompletedReportsPage.paginationLink(10).should('not.exist')
    allCompletedReportsPage.paginationLink(4).should('not.exist')
    allCompletedReportsPage.paginationLink(5).should('exist')
    allCompletedReportsPage.paginationLink(14).should('exist')
    allCompletedReportsPage.paginationLink(15).should('not.exist')
    // Page 14
    allCompletedReportsPage.paginationLink(14).first().click()
    allCompletedReportsPage.previousLink().should('exist')
    allCompletedReportsPage.nextLink().should('exist')
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 261 to 280 of 300 results')
    allCompletedReportsPage.paginationLink(14).should('not.exist')
    allCompletedReportsPage.paginationLink(5).should('not.exist')
    allCompletedReportsPage.paginationLink(6).should('exist')
    allCompletedReportsPage.paginationLink(15).should('exist')
    allCompletedReportsPage.paginationLink(16).should('not.exist')
    // Page 15 - Last
    allCompletedReportsPage.paginationLink(15).first().click()
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
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: [] })
    // The result to return when filtering for the dates we will enter in the date picker and status selected.
    cy.task('stubGetAllReportedAdjudications', {
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
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])

    cy.visit(adjudicationUrls.allCompletedReports.root) // visit page one
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    allCompletedReportsPage.noResultsMessage().should('contain', 'No completed reports.')
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('1/1/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('1/9/2022').toISOString(), 'short')
    adjudicationsFilter.fromDateInput().clear().type(fromDate)
    adjudicationsFilter.toDateInput().clear().type(toDate)
    allCompletedReportsPage.uncheckAllCheckboxes()
    allCompletedReportsPage.checkCheckboxWithValue('UNSCHEDULED')
    adjudicationsFilter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=01%2F01%2F2022&toDate=09%2F01%2F2022&status=UNSCHEDULED&transfersOnly=false')
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 1 of 1 results')
  })

  it('UNSCHEDULED staatus - filtering and pagination should work together', () => {
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 300, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
      })
    })
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: [] })
    // The results to return when initially filtering
    cy.task('stubGetAllReportedAdjudications', {
      number: 0, // Page 1
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.UNSCHEDULED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    // The results to return after going to another page after having filtered previously
    cy.task('stubGetAllReportedAdjudications', {
      number: 1, // Page 2
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.UNSCHEDULED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])
    cy.visit(adjudicationUrls.allCompletedReports.root) // visit page one
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('10/10/2021').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('10/19/2021').toISOString(), 'short')
    adjudicationsFilter.fromDateInput().clear().type(fromDate)
    adjudicationsFilter.toDateInput().clear().type(toDate)
    allCompletedReportsPage.uncheckAllCheckboxes()
    allCompletedReportsPage.checkCheckboxWithValue('UNSCHEDULED')
    adjudicationsFilter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=UNSCHEDULED&transfersOnly=false')
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 20 of 300 results')
    allCompletedReportsPage.paginationLink(2).first().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      // We expect the initial filter parameters to have been passed through on the links.
      expect(loc.search).to.eq(
        '?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=UNSCHEDULED&transfersOnly=false&pageNumber=2'
      )
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 21 to 40 of 300 results')
    allCompletedReportsPage.resultsTable().should('exist')
    allCompletedReportsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('1')
        expect($data.get(1).innerText).to.contain('15 November 2345 - 11:30')
        expect($data.get(2).innerText).to.contain('Potter, Harry - A1234AA')
        expect($data.get(3).innerText).to.contain('Unscheduled')
        expect($data.get(4).innerText).to.equal('-')
        expect($data.get(5).innerHTML).to.contain('/hearing-details/21/review')
        expect($data.get(6).innerHTML).to.contain('/prisoner-report/21/review')
        expect($data.get(6).innerText).to.contain('View report')
      })
  })

  it('SCHEDULED status should show scheduled hearing date link', () => {
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 300, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2222-10-10T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
        status: ReportedAdjudicationStatus.SCHEDULED,
        hearings: [
          testData.singleHearing({
            dateTimeOfHearing: '2022-11-23T17:00:00',
            id: 68,
          }),
          testData.singleHearing({
            dateTimeOfHearing: '2022-11-28T09:00:00',
            id: 67,
          }),
          testData.singleHearing({
            dateTimeOfHearing: '2022-11-30T09:50:00',
            id: 69,
          }),
          testData.singleHearing({
            dateTimeOfHearing: '2023-11-30T10:00:00',
            id: 70,
          }),
        ],
      })
    })
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: [] })
    // The results to return when initially filtering
    cy.task('stubGetAllReportedAdjudications', {
      number: 0, // Page 1
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.SCHEDULED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    // The results to return after going to another page after having filtered previously
    cy.task('stubGetAllReportedAdjudications', {
      number: 1, // Page 2
      allContent: manyReportedAdjudications,
      filter: { status: ReportedAdjudicationStatus.SCHEDULED, fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])
    cy.visit(adjudicationUrls.allCompletedReports.root) // visit page one
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('10/10/2021').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('10/19/2021').toISOString(), 'short')
    adjudicationsFilter.fromDateInput().clear().type(fromDate)
    adjudicationsFilter.toDateInput().clear().type(toDate)
    allCompletedReportsPage.uncheckAllCheckboxes()
    allCompletedReportsPage.checkCheckboxWithValue('SCHEDULED')
    adjudicationsFilter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq('?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=SCHEDULED&transfersOnly=false')
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 20 of 300 results')
    allCompletedReportsPage.paginationLink(2).first().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      // We expect the initial filter parameters to have been passed through on the links.
      expect(loc.search).to.eq(
        '?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=SCHEDULED&transfersOnly=false&pageNumber=2'
      )
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 21 to 40 of 300 results')
    allCompletedReportsPage.resultsTable().should('exist')
    allCompletedReportsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('1')
        expect($data.get(1).innerText).to.contain('15 November 2345 - 11:30')
        expect($data.get(2).innerText).to.contain('Potter, Harry - A1234AA')
        expect($data.get(3).innerText).to.contain('Scheduled')
        expect($data.get(4).innerText).to.contain('30 November 2023 - 10:00')
        expect($data.get(5).innerHTML).to.contain('/hearing-details/21/review')
        expect($data.get(6).innerHTML).to.contain('/prisoner-report/21/review')
        expect($data.get(6).innerText).to.contain('View report')
      })
  })

  it('SCHEDULED and UNSCHEDULED adjudications should show together', () => {
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 5, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2222-10-10T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
        status: _ > 1 ? ReportedAdjudicationStatus.UNSCHEDULED : ReportedAdjudicationStatus.SCHEDULED,
        hearings: [
          {
            id: 68,
            locationId: 357596,
            dateTimeOfHearing: '2022-11-23T17:00:00',
            oicHearingType: 'INAD_ADULT',
          },
        ],
      })
    })
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: [] })
    // The results to return when initially filtering
    cy.task('stubGetAllReportedAdjudications', {
      number: 0, // Page 1
      allContent: manyReportedAdjudications,
      filter: { status: 'UNSCHEDULED,SCHEDULED', fromDate: '2021-10-10', toDate: '2021-10-19' },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])
    cy.visit(adjudicationUrls.allCompletedReports.root) // visit page one
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('10/10/2021').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('10/19/2021').toISOString(), 'short')
    adjudicationsFilter.fromDateInput().clear().type(fromDate)
    adjudicationsFilter.toDateInput().clear().type(toDate)
    allCompletedReportsPage.uncheckAllCheckboxes()
    allCompletedReportsPage.checkCheckboxWithValue('UNSCHEDULED')
    allCompletedReportsPage.checkCheckboxWithValue('SCHEDULED')
    adjudicationsFilter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allCompletedReports.root)
      expect(loc.search).to.eq(
        '?fromDate=10%2F10%2F2021&toDate=19%2F10%2F2021&status=UNSCHEDULED&status=SCHEDULED&transfersOnly=false'
      )
    })
    allCompletedReportsPage.paginationResults().should('have.text', 'Showing 1 to 5 of 5 results')
    allCompletedReportsPage.resultsTable().should('exist')
    allCompletedReportsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('1')
        expect($data.get(1).innerText).to.contain('15 November 2345 - 11:30')
        expect($data.get(2).innerText).to.contain('Potter, Harry - A1234AA')
        expect($data.get(3).innerText).to.contain('Scheduled')
        expect($data.get(4).innerText).to.contain('23 November 2022 - 17:00')
        expect($data.get(5).innerHTML).to.contain('/hearing-details/1/review')
        expect($data.get(6).innerHTML).to.contain('/prisoner-report/1/review')
        expect($data.get(6).innerText).to.contain('View report')
        expect($data.get(7).innerText).to.contain('2')
        expect($data.get(8).innerText).to.contain('15 November 2345 - 11:30')
        expect($data.get(9).innerText).to.contain('Potter, Harry - A1234AA')
        expect($data.get(10).innerText).to.contain('Unscheduled')
        expect($data.get(11).innerText).to.equal('-')
        expect($data.get(12).innerHTML).to.contain('/hearing-details/2/review')
        expect($data.get(13).innerHTML).to.contain('/prisoner-report/2/review')
        expect($data.get(13).innerText).to.contain('View report')
      })
  })

  it('date range validation works', () => {
    cy.task('stubGetAllReportedAdjudications', {})
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.allCompletedReports.root)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    const fromDate = formatDateForDatePicker(new Date('10/19/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('10/10/2022').toISOString(), 'short')
    adjudicationsFilter.fromDateInput().clear().type(fromDate)
    adjudicationsFilter.toDateInput().clear().type(toDate)
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

  it('dynamic links for transferred prisoners', () => {
    cy.task('stubGetAllReportedAdjudications', {})
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    const reportedAdjudications = [
      testData.reportedAdjudication({
        chargeNumber: '1',
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        otherData: {
          overrideAgencyId: 'LEI',
          transferableActionsAllowed: true,
        },
      }),
      testData.reportedAdjudication({
        chargeNumber: '2',
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
      }),
      // Report has been transferred and this user is in the override agency (so actions not allowed)
      testData.reportedAdjudication({
        chargeNumber: '3',
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        otherData: {
          overrideAgencyId: 'LEI',
          transferableActionsAllowed: false,
        },
      }),
    ]
    cy.task('stubGetAllReportedAdjudications', { number: 0, allContent: reportedAdjudications })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])
    cy.visit(adjudicationUrls.allCompletedReports.root)
    const allCompletedReportsPage: AllCompletedReportsPage = Page.verifyOnPage(AllCompletedReportsPage)
    allCompletedReportsPage.viewReportLink().first().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(1))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    allCompletedReportsPage.viewReportLink().eq(1).click() // this is the second report (zero indexed)
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(2))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    allCompletedReportsPage.viewReportLink().last().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.viewOnly(3))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    allCompletedReportsPage.viewHearingsLink().first().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1'))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    allCompletedReportsPage.viewHearingsLink().eq(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('2'))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    allCompletedReportsPage.viewHearingsLink().eq(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.viewOnly('3'))
    })
  })
})
