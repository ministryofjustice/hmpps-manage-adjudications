import moment from 'moment'
import TransferredReportsPage from '../pages/allReports'
import Page from '../pages/page'
import { generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AdjudicationsFilter from '../pages/adjudicationsFilter'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

context('Transferred Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.signIn()
  })

  it('should say when there are no results', () => {
    cy.task('stubGetAllReportedAdjudications', {
      filter: {
        status: null,
        toDate: moment().format('YYYY-MM-DD'),
        fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        transfersOnly: true,
      },
    })
    cy.task('stubGetBatchPrisonerDetails')

    cy.visit(adjudicationUrls.allTransferredReports.root)
    const transferredReportsPage: TransferredReportsPage = Page.verifyOnPage(TransferredReportsPage)

    transferredReportsPage.noResultsMessage().should('exist')
  })

  it('should display the correct data on the first page', () => {
    cy.task('stubGetAllReportedAdjudications', {
      filter: {
        status: null,
        toDate: moment().format('YYYY-MM-DD'),
        fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        transfersOnly: true,
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 20, _ => {
      return testData.reportedAdjudication({
        adjudicationNumber: _,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
      })
    })
    cy.task('stubGetAllReportedAdjudications', {
      number: 0,
      allContent: manyReportedAdjudications,
      filter: {
        status: null,
        toDate: moment().format('YYYY-MM-DD'),
        fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        transfersOnly: true,
      },
    }) // Page 1
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])

    cy.visit(adjudicationUrls.allTransferredReports.root)
    const transferredReportsPage: TransferredReportsPage = Page.verifyOnPage(TransferredReportsPage)
    transferredReportsPage.resultsTable().should('exist')
    transferredReportsPage
      .resultsTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Discovery date and time')
        expect($headings.get(1).innerText).to.contain('Name and prison number')
        expect($headings.get(2).innerText).to.contain('Status')
        expect($headings.get(3).innerText).to.contain('Latest scheduled hearing')
        expect($headings.get(4) === undefined)
      })
    transferredReportsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('15 November 2345 - 11:30')
        expect($data.get(1).innerText).to.contain('Potter, Harry - A1234AA')
        expect($data.get(2).innerText).to.contain('Awaiting review')
        // test hearings link is not populated
        expect($data.get(4).innerText).to.equal('')
        expect($data.get(5).innerText).to.contain('View report')
      })
  })

  it('filtering should work', () => {
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetAllReportedAdjudications', {
      number: 0,
      allContent: [],
      filter: {
        status: null,
        toDate: moment().format('YYYY-MM-DD'),
        fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        transfersOnly: true,
      },
    })
    // The result to return when filtering for the dates we will enter in the date picker and status selected.
    cy.task('stubGetAllReportedAdjudications', {
      number: 0,
      allContent: [
        testData.reportedAdjudication({
          adjudicationNumber: 1,
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2022-01-01T11:30:00',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
        }),
      ],
      filter: {
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        fromDate: '2022-01-01',
        toDate: '2022-01-09',
        transfersOnly: true,
      },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])

    cy.visit(adjudicationUrls.allTransferredReports.root) // visit page one
    const transferredReportsPage: TransferredReportsPage = Page.verifyOnPage(TransferredReportsPage)
    transferredReportsPage.noResultsMessage().should('contain', 'No completed reports.')
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    adjudicationsFilter.forceFromDate(1, 1, 2022)
    adjudicationsFilter.forceToDate(9, 1, 2022)
    transferredReportsPage.uncheckAllCheckboxes()
    transferredReportsPage.checkCheckboxWithValue('UNSCHEDULED')
    adjudicationsFilter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.allTransferredReports.root)
      expect(loc.search).to.eq('?fromDate=01%2F01%2F2022&toDate=09%2F01%2F2022&status=UNSCHEDULED&transfersOnly=true')
    })
    transferredReportsPage.paginationResults().should('have.text', 'Showing 1 to 1 of 1 results')
  })

  it('default date range is as expected', () => {
    cy.task('stubGetAllReportedAdjudications', {
      filter: {
        status: null,
        toDate: moment().format('YYYY-MM-DD'),
        fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        transfersOnly: true,
      },
    })
    cy.task('stubGetBatchPrisonerDetails')

    cy.visit(adjudicationUrls.allTransferredReports.root)
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    adjudicationsFilter.toDateInput().should('have.value', moment().format('DD/MM/YYYY'))
    adjudicationsFilter.fromDateInput().should('have.value', moment().subtract(2, 'days').format('DD/MM/YYYY'))
  })

  it('dynamic links for transferred prisoners', () => {
    cy.task('stubGetAllReportedAdjudications', {
      filter: {
        status: null,
        fromDate: '2022-01-01',
        toDate: '2022-01-09',
        transfersOnly: true,
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    const reportedAdjudications = [
      testData.reportedAdjudication({
        adjudicationNumber: 1,
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
        adjudicationNumber: 2,
        prisonerNumber: 'A1234AA',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        dateTimeOfDiscovery: '2345-11-15T11:30:00',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
      }),
      testData.reportedAdjudication({
        adjudicationNumber: 3,
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
    const transferredReportsPage: TransferredReportsPage = Page.verifyOnPage(TransferredReportsPage)
    transferredReportsPage.viewReportLink().first().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(1))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    transferredReportsPage.viewReportLink().eq(1).click() // this is the second report (zero indexed)
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(2))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    transferredReportsPage.viewReportLink().last().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.viewOnly(3))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    transferredReportsPage.viewHearingsLink().first().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    transferredReportsPage.viewHearingsLink().eq(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(2))
    })
    cy.visit(adjudicationUrls.allCompletedReports.root)
    transferredReportsPage.viewHearingsLink().eq(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.viewOnly(3))
    })
  })
})