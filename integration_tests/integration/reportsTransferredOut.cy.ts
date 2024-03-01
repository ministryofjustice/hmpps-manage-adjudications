import reportsTransferredOutPage from '../pages/allReportsFromTransfers'
import Page from '../pages/page'
import { generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AdjudicationsFilter from '../pages/adjudicationsFilter'
import TestData from '../../server/routes/testutils/testData'
import { TransferredReportType, transferredOutStatuses } from '../../server/utils/adjudicationFilterHelper'

const testData = new TestData()

context('Reports transferred out', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetAgency', { agencyId: 'LEI', response: { agencyId: 'LEI', description: 'LEICESTER (HMP)' } })
    cy.signIn()
  })

  it('should say when there are no results', () => {
    cy.task('stubGetTransferredAdjudications', {
      filter: {
        status: transferredOutStatuses,
        type: TransferredReportType.OUT,
      },
    })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.reportsTransferredOut.urls.start())
    const transferredReportsPage: reportsTransferredOutPage = Page.verifyOnPage(reportsTransferredOutPage)

    transferredReportsPage.noResultsMessage().should('exist')
  })

  it('should display the correct data on the first page', () => {
    cy.task('stubGetTransferredAdjudications', {
      filter: {
        status: transferredOutStatuses,
        type: TransferredReportType.OUT,
      },
    })
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
        status: ReportedAdjudicationStatus.UNSCHEDULED,
      })
    })
    cy.task('stubGetTransferredAdjudications', {
      number: 0,
      allContent: manyReportedAdjudications,
      filter: {
        status: transferredOutStatuses,
        type: TransferredReportType.OUT,
      },
    }) // Page 1
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])

    cy.visit(adjudicationUrls.reportsTransferredOut.urls.start())
    const transferredReportsPage: reportsTransferredOutPage = Page.verifyOnPage(reportsTransferredOutPage)
    transferredReportsPage.resultsTable().should('exist')
    transferredReportsPage
      .resultsTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Charge number')
        expect($headings.get(1).innerText).to.contain('Discovery date and time')
        expect($headings.get(2).innerText).to.contain('Name and prison number')
        expect($headings.get(3).innerText).to.contain('Status')
        expect($headings.get(4).innerText).to.contain('Transferred to')
        expect($headings.get(5) === undefined)
      })
    transferredReportsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('1')
        expect($data.get(1).innerText).to.contain('15 November 2345 - 11:30')
        expect($data.get(2).innerText).to.contain('Potter, Harry - A1234AA')
        expect($data.get(3).innerText).to.contain('Unscheduled')
        expect($data.get(4).innerText).to.equal('LEICESTER (HMP)')
        expect($data.get(5).innerText).to.contain('View report')
      })
  })

  it('filtering should work', () => {
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername('USER1'),
    })
    // The empty results to return when first landing on your completed reports page.
    cy.task('stubGetTransferredAdjudications', {
      number: 0,
      allContent: [],
      filter: {
        status: transferredOutStatuses,
        type: TransferredReportType.OUT,
      },
    })
    // The result to return when filtering for the status selected.
    cy.task('stubGetTransferredAdjudications', {
      number: 0,
      allContent: [
        testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2022-01-01T11:30:00',
          status: ReportedAdjudicationStatus.SCHEDULED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2030-01-04T09:00:00',
              id: 987,
              locationId: 2,
            }),
          ],
        }),
      ],
      filter: {
        status: ReportedAdjudicationStatus.SCHEDULED,
        type: TransferredReportType.OUT,
      },
    })
    cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'HARRY', lastName: 'POTTER' }])

    cy.visit(adjudicationUrls.reportsTransferredOut.urls.start()) // visit page one
    const transferredReportsPage: reportsTransferredOutPage = Page.verifyOnPage(reportsTransferredOutPage)
    transferredReportsPage.noResultsMessage().should('contain', 'There are no reports to update for transfers out.')
    const adjudicationsFilter: AdjudicationsFilter = new AdjudicationsFilter()
    transferredReportsPage.uncheckAllCheckboxes()
    transferredReportsPage.checkCheckboxWithValue('SCHEDULED')
    adjudicationsFilter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.reportsTransferredOut.urls.start())
      expect(loc.search).to.eq('?status=SCHEDULED&type=OUT')
    })
    transferredReportsPage.paginationResults().should('have.text', 'Showing 1 to 1 of 1 results')
  })
})
