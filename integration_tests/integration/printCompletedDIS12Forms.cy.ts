import moment from 'moment'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import PrintDISFormsFilter from '../pages/printDISFormsFilter'
import TestData from '../../server/routes/testutils/testData'
import PrintCompletedDISFormsPage from '../pages/printCompletedDIS12Forms'
import { allIssueStatuses, IssueStatus } from '../../server/data/ReportedAdjudicationResult'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()

const prisoners = [
  testData.simplePrisoner('G7234VB', 'JAMES', 'SMITH', 'MDI-RECP'),
  testData.simplePrisoner('P3785CP', 'PETER', 'TOVEY', 'MDI-MCASU'),
]

context('Print completed DIS forms', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUsersLocations', testData.residentialLocationsFromPrisonApi())
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.signIn()
  })
  it('should have the required elements and expected default filter - no reports', () => {
    cy.task('stubGetIssueDataHearingDate', {
      response: {
        reportedAdjudications: [],
      },
    })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.printCompletedDisForms.root)
    const printCompletedDISFormsPage: PrintCompletedDISFormsPage = Page.verifyOnPage(PrintCompletedDISFormsPage)
    const filter: PrintDISFormsFilter = new PrintDISFormsFilter()
    printCompletedDISFormsPage.noResultsMessage().should('exist')
    printCompletedDISFormsPage.resultsTable().should('not.exist')
    filter.fromDateInput().should('have.value', moment().format('DD/MM/YYYY'))
    filter.toDateInput().should('have.value', moment().add(2, 'days').format('DD/MM/YYYY'))
    filter.selectLocation().should('have.value', '')
    filter.issuedCheckbox().should('be.checked')
    filter.notIssuedCheckbox().should('be.checked')
  })
  it('has working validation for the date filters', () => {
    cy.task('stubGetIssueDataHearingDate', {
      response: { reportedAdjudications: [] },
    })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.printCompletedDisForms.root)
    const filter: PrintDISFormsFilter = new PrintDISFormsFilter()
    const fromDate = formatDateForDatePicker(new Date('12/5/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('12/3/2022').toISOString(), 'short')
    filter.fromDateInput().clear().type(fromDate)
    filter.toDateInput().clear().type(toDate)
    filter.applyButton().click()
    filter.filterBar().should('contain.text', 'Enter a date that is before or the same as the ‘date to’')
  })
  it('have working links to take the user to the print page for the adjudication', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfFirstHearing: '2022-12-06T10:00:00',
      }),
    ]
    cy.task('stubGetIssueDataHearingDate', {
      response: { reportedAdjudications: adjudicationResponse },
    })
    cy.task('stubGetBatchPrisonerDetails', [prisoners[0]])
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'G7234VB',
      response: [{ alertCode: 'CSIP' }],
    })
    cy.visit(adjudicationUrls.printCompletedDisForms.root, { failOnStatusCode: false })
    const printCompletedDISFormsPage: PrintCompletedDISFormsPage = Page.verifyOnPage(PrintCompletedDISFormsPage)
    printCompletedDISFormsPage.printDISFormsLink('12345').should('exist')
    printCompletedDISFormsPage.printDISFormsLink('12345').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.printReport.urls.dis12('12345'))
      expect(loc.search).to.eq(`?referrer=${adjudicationUrls.printCompletedDisForms.urls.start()}`)
    })
  })
  it('has all the correct data in the table', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIssue: '2022-12-05T15:00:00',
        dateTimeOfFirstHearing: '2022-12-06T10:00:00',
      }),
      testData.reportedAdjudication({
        chargeNumber: '23456',
        prisonerNumber: 'P3785CP',
        dateTimeOfFirstHearing: '2022-12-07T10:00:00',
      }),
    ]
    cy.task('stubGetIssueDataHearingDate', {
      response: { reportedAdjudications: adjudicationResponse },
    })
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    // First prisoner - G7234VB
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'G7234VB',
      response: {
        content: [
          {
            alertCode: {
              code: 'HA',
            },
          },
          {
            alertCode: {
              code: 'CSIP',
            },
          },
          {
            alertCode: {
              code: 'PEEP',
            },
          },
          {
            alertCode: {
              code: 'PRGNT',
            },
          },
        ],
      },
    })
    // Second prisoner - P3785CP
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'P3785CP',
      response: [],
    })
    cy.visit(adjudicationUrls.printCompletedDisForms.root, { failOnStatusCode: false })
    const printCompletedDISFormsPage: PrintCompletedDISFormsPage = Page.verifyOnPage(PrintCompletedDISFormsPage)
    printCompletedDISFormsPage
      .resultsTable()
      .find('th')
      .then($headers => {
        expect($headers.get(0).innerText).to.contain('Name and prison number')
        expect($headers.get(1).innerText).to.contain('Hearing date and time')
        expect($headers.get(2).innerText).to.contain('Prisoner location')
        expect($headers.get(3).innerText).to.contain('Relevant alerts')
        expect($headers.get(4).innerText).to.contain('Report issued')
        expect($headers.get(5).innerText).to.contain('')
      })
    printCompletedDISFormsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Smith, James - G7234VB')
        expect($data.get(1).innerText).to.contain('6 December 2022 - 10:00')
        expect($data.get(2).innerText).to.contain('MDI-RECP')
        expect($data.get(3).innerText).to.contain('ACCT OPEN')
        expect($data.get(3).innerText).to.contain('PEEP')
        expect($data.get(3).innerText).to.contain('CSIP')
        expect($data.get(3).innerText).to.contain('PREGNANT')
        expect($data.get(4).innerText).to.contain('Issued')
        expect($data.get(5).innerText).to.contain('Print notice of report')
        expect($data.get(6).innerText).to.contain('Tovey, Peter - P3785CP')
        expect($data.get(7).innerText).to.contain('7 December 2022 - 10:00')
        expect($data.get(8).innerText).to.contain('MDI-MCASU')
        expect($data.get(9).innerText).to.contain('-')
        expect($data.get(10).innerText).to.contain('Not issued')
        expect($data.get(11).innerText).to.contain('Print notice of report')
      })
  })
  it('should handle if there is prisoner information missing', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIssue: '2022-12-05T15:00:00',
        dateTimeOfFirstHearing: '2022-12-06T10:00:00',
      }),
      testData.reportedAdjudication({
        chargeNumber: '23456',
        prisonerNumber: 'P3785CP',
        dateTimeOfFirstHearing: '2022-12-07T10:00:00',
      }),
    ]
    cy.task('stubGetIssueDataHearingDate', {
      response: { reportedAdjudications: adjudicationResponse },
    })
    cy.task('stubGetBatchPrisonerDetails', [prisoners[0]])
    // First prisoner - G7234VB
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'G7234VB',
      response: {
        content: [
          {
            alertCode: {
              code: 'HA',
            },
          },
          {
            alertCode: {
              code: 'CSIP',
            },
          },
          {
            alertCode: {
              code: 'PEEP',
            },
          },
          {
            alertCode: {
              code: 'PRGNT',
            },
          },
        ],
      },
    })
    // Second prisoner - P3785CP
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'P3785CP',
      response: [],
      status: 404,
    })
    cy.visit(adjudicationUrls.printCompletedDisForms.root, { failOnStatusCode: false })
    const printCompletedDISFormsPage: PrintCompletedDISFormsPage = Page.verifyOnPage(PrintCompletedDISFormsPage)
    printCompletedDISFormsPage
      .resultsTable()
      .find('th')
      .then($headers => {
        expect($headers.get(0).innerText).to.contain('Name and prison number')
        expect($headers.get(1).innerText).to.contain('Hearing date and time')
        expect($headers.get(2).innerText).to.contain('Prisoner location')
        expect($headers.get(3).innerText).to.contain('Relevant alerts')
        expect($headers.get(4).innerText).to.contain('Report issued')
        expect($headers.get(5).innerText).to.contain('')
      })
    printCompletedDISFormsPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('Smith, James - G7234VB')
        expect($data.get(1).innerText).to.contain('6 December 2022 - 10:00')
        expect($data.get(2).innerText).to.contain('MDI-RECP')
        expect($data.get(3).innerText).to.contain('ACCT OPEN')
        expect($data.get(3).innerText).to.contain('PEEP')
        expect($data.get(3).innerText).to.contain('CSIP')
        expect($data.get(3).innerText).to.contain('PREGNANT')
        expect($data.get(4).innerText).to.contain('Issued')
        expect($data.get(5).innerText).to.contain('Print notice of report')
        expect($data.get(6).innerText).to.contain('Unknown - P3785CP')
        expect($data.get(7).innerText).to.contain('7 December 2022 - 10:00')
        expect($data.get(8).innerText).to.contain('Unknown')
        expect($data.get(9).innerText).to.contain('-')
        expect($data.get(10).innerText).to.contain('Not issued')
        expect($data.get(11).innerText).to.contain('Print notice of report')
      })
  })
  it('should filter on parameters given - no location', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIssue: '2022-12-05T15:00:00',
        dateTimeOfFirstHearing: '2022-12-06T10:00:00',
      }),
      testData.reportedAdjudication({
        chargeNumber: '23456',
        prisonerNumber: 'P3785CP',
        dateTimeOfFirstHearing: '2022-12-07T10:00:00',
      }),
    ]
    // Without filter
    cy.task('stubGetIssueDataHearingDate', {
      response: { reportedAdjudications: adjudicationResponse },
    })
    // With filter
    cy.task('stubGetIssueDataHearingDate', {
      filter: { fromDate: '2022-12-05', toDate: '2022-12-07', locationId: null, issueStatus: IssueStatus.ISSUED },
      response: { reportedAdjudications: [adjudicationResponse[0]] },
    })
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    // G7234VB
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'G7234VB',
      response: {
        content: [
          {
            alertCode: {
              code: 'HA',
            },
          },
          {
            alertCode: {
              code: 'CSIP',
            },
          },
          {
            alertCode: {
              code: 'PEEP',
            },
          },
          {
            alertCode: {
              code: 'PRGNT',
            },
          },
        ],
      },
    })
    // Second prisoner - P3785CP
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'P3785CP',
      response: [],
    })
    cy.visit(adjudicationUrls.printCompletedDisForms.root, { failOnStatusCode: false })
    const printCompletedDISFormsPage: PrintCompletedDISFormsPage = Page.verifyOnPage(PrintCompletedDISFormsPage)
    printCompletedDISFormsPage.resultsTable().find('tr').should('have.length', 3)
    const filter: PrintDISFormsFilter = new PrintDISFormsFilter()
    const fromDate = formatDateForDatePicker(new Date('12/5/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('12/7/2022').toISOString(), 'short')
    filter.fromDateInput().clear().type(fromDate)
    filter.toDateInput().clear().type(toDate)
    filter.notIssuedCheckbox().uncheck()
    filter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.printCompletedDisForms.root)
      expect(loc.search).to.eq('?fromDate=05%2F12%2F2022&toDate=07%2F12%2F2022&locationId=&issueStatus=ISSUED')
    })
    printCompletedDISFormsPage.resultsTable().find('tr').should('have.length', 2)
  })
  it('should filter on parameters given - location', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIssue: '2022-12-05T15:00:00',
        dateTimeOfFirstHearing: '2022-12-06T10:00:00',
      }),
      testData.reportedAdjudication({
        chargeNumber: '23456',
        prisonerNumber: 'P3785CP',
        dateTimeOfFirstHearing: '2022-12-07T10:00:00',
      }),
    ]
    // Without filter
    cy.task('stubGetIssueDataHearingDate', {
      response: { reportedAdjudications: adjudicationResponse },
    })
    // With filter
    cy.task('stubGetIssueDataHearingDate', {
      filter: { fromDate: '2022-12-05', toDate: '2022-12-07', locationId: 27102, issueStatus: allIssueStatuses },
      response: { reportedAdjudications: adjudicationResponse },
    })
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    // G7234VB
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'G7234VB',
      response: {
        content: [
          {
            alertCode: {
              code: 'HA',
            },
          },
          {
            alertCode: {
              code: 'CSIP',
            },
          },
          {
            alertCode: {
              code: 'PEEP',
            },
          },
          {
            alertCode: {
              code: 'PRGNT',
            },
          },
        ],
      },
    })
    // Second prisoner - P3785CP
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'P3785CP',
      response: [],
    })
    cy.visit(adjudicationUrls.printCompletedDisForms.root, { failOnStatusCode: false })
    const printCompletedDISFormsPage: PrintCompletedDISFormsPage = Page.verifyOnPage(PrintCompletedDISFormsPage)
    printCompletedDISFormsPage.resultsTable().find('tr').should('have.length', 3)
    const filter: PrintDISFormsFilter = new PrintDISFormsFilter()
    const fromDate = formatDateForDatePicker(new Date('12/5/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('12/7/2022').toISOString(), 'short')
    filter.fromDateInput().clear().type(fromDate)
    filter.toDateInput().clear().type(toDate)
    filter.selectLocation().select('Segregation MPU')
    filter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.printCompletedDisForms.root)
      expect(loc.search).to.eq(
        '?fromDate=05%2F12%2F2022&toDate=07%2F12%2F2022&locationId=27102&issueStatus=ISSUED&issueStatus=NOT_ISSUED'
      )
    })
    printCompletedDISFormsPage.resultsTable().find('tr').should('have.length', 2)
  })
})
