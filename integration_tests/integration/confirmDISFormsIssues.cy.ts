import moment from 'moment'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DISFormsFilter from '../pages/DISFormsFilter'
import TestData from '../../server/routes/testutils/testData'
import ConfirmDISFormsIssuedPage from '../pages/confirmDISFormsIssues'

const testData = new TestData()

const prisoners = [
  testData.simplePrisoner('G7234VB', 'JAMES', 'SMITH', 'MDI-RECP'),
  testData.simplePrisoner('P3785CP', 'PETER', 'TOVEY', 'MDI-MCASU'),
]

context('Confirm DIS forms have been issued', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUsersLocations', testData.residentialLocations())
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
    cy.signIn()
  })

  it('should have the required elements - no reports', () => {
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: [] } })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.noResultsMessage().should('exist')
    confirmDISFormsIssued.resultsTable().should('not.exist')
  })
  it('has the expected default date range', () => {
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: [] } })
    cy.task('stubGetBatchPrisonerDetails')

    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const filter: DISFormsFilter = new DISFormsFilter()
    filter.toDateInput().should('have.value', moment().format('DD/MM/YYYY'))
    filter.fromDateInput().should('have.value', moment().subtract(2, 'days').format('DD/MM/YYYY'))
  })
  it('has working validation for the date filters', () => {
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: [] } })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const filter: DISFormsFilter = new DISFormsFilter()
    filter.forceFromDate(5, 12, 2022)
    filter.forceToDate(3, 12, 2022)
    filter.applyButton().click()
    filter.filterBar().should('contain.text', 'Enter a date that is before or the same as the ‘date to’')
  })
  it('has working links to add date and time of issue', () => {
    const adjudicationResponse = [
      testData.completedAdjudication(
        12345,
        'G7234VB',
        testData.generateOtherData(
          'Smith, James',
          'James Smith',
          '',
          'MDI-MCASU',
          '5 December 2022 - 11:11',
          '2022-12-05T11:11:00',
          '5 December 2022 - 15:00'
        ),
        '2022-12-06T10:45:00'
      ),
    ]
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetBatchPrisonerDetails', [prisoners[0]])
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.addDateAndTimeLink(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.addIssueDateTime.urls.start(12345))
    })
  })
  it('should have the required elements - reports present but not issued', () => {
    const adjudicationResponse = [
      testData.completedAdjudication(
        12345,
        'G7234VB',
        testData.generateOtherData(
          'Smith, James',
          'James Smith',
          '',
          'MDI-MCASU',
          '5 December 2022 - 11:11',
          '2022-12-05T11:11:00',
          '5 December 2022 - 15:00'
        ),
        '2022-12-06T10:45:00'
      ),
      testData.completedAdjudication(
        23456,
        'P3785CP',
        testData.generateOtherData(
          'Tovey, Peter',
          'Peter Tovey',
          '',
          'MDI-RECP',
          '6 December 2022 - 12:10',
          '2022-12-06T11:11:00',
          '6 December 2022 - 16:30'
        ),
        '2022-12-06T11:45:00'
      ),
    ]
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.noResultsMessage().should('not.exist')
    confirmDISFormsIssued
      .resultsTable()
      .find('th')
      .then($headers => {
        expect($headers.get(0).innerText).to.contain('Name and prison number')
        expect($headers.get(1).innerText).to.contain('Discovery date and time')
        expect($headers.get(2).innerText).to.contain('Prisoner location')
        expect($headers.get(3).innerText).to.contain('Issue date and time')
        expect($headers.get(4).innerText).to.contain('Issuing officer')
        expect($headers.get(5).innerText).to.contain('')
      })
    confirmDISFormsIssued
      .resultsTable()
      .find('td')
      .then($headers => {
        expect($headers.get(0).innerText).to.contain('Smith, James - G7234VB')
        expect($headers.get(1).innerText).to.contain('6 December 2022 - 10:45')
        expect($headers.get(2).innerText).to.contain('MDI-RECP')
        expect($headers.get(3).innerText).to.contain('-')
        expect($headers.get(4).innerText).to.contain('-')
        expect($headers.get(5).innerText).to.contain('Add date and time')
        expect($headers.get(6).innerText).to.contain('Tovey, Peter - P3785CP')
        expect($headers.get(7).innerText).to.contain('6 December 2022 - 11:45')
        expect($headers.get(8).innerText).to.contain('MDI-MCASU')
        expect($headers.get(9).innerText).to.contain('-')
        expect($headers.get(10).innerText).to.contain('-')
        expect($headers.get(11).innerText).to.contain('Add date and time')
      })
  })
  it('should show the date and time of issuing, as the issuing officer if data is present', () => {
    const adjudicationResponse = [
      testData.completedAdjudication(
        12345,
        'G7234VB',
        testData.generateOtherData(
          'Smith, James',
          'James Smith',
          'TEST_GEN',
          'MDI-MCASU',
          '5 December 2022 - 11:11',
          '2022-12-05T11:11:00',
          '5 December 2022 - 15:00',
          '2022-12-05T15:00:00'
        ),
        '2022-12-06T10:45:00'
      ),
    ]
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.noResultsMessage().should('not.exist')
    confirmDISFormsIssued
      .resultsTable()
      .find('td')
      .then($headers => {
        expect($headers.get(0).innerText).to.contain('Smith, James - G7234VB')
        expect($headers.get(1).innerText).to.contain('6 December 2022 - 10:45')
        expect($headers.get(2).innerText).to.contain('MDI-RECP')
        expect($headers.get(3).innerText).to.contain('5 December 2022 - 15:00')
        expect($headers.get(4).innerText).to.contain('T. User')
        expect($headers.get(5).innerText).to.contain('Add date and time')
      })
  })
  it('should filter on the parameters given - dates only', () => {
    const adjudicationResponse = [
      testData.completedAdjudication(
        12345,
        'G7234VB',
        testData.generateOtherData(
          'Smith, James',
          'James Smith',
          'TEST_GEN',
          'MDI-MCASU',
          '5 December 2022 - 11:11',
          '2022-12-05T11:11:00',
          '5 December 2022 - 15:00',
          '2022-12-05T15:00:00'
        ),
        '2022-12-05T10:45:00'
      ),
      testData.completedAdjudication(
        23456,
        'P3785CP',
        testData.generateOtherData(
          'Tovey, Peter',
          'Peter Tovey',
          'TEST_GEN',
          'MDI-RECP',
          '6 December 2022 - 12:10',
          '2022-12-06T11:11:00',
          '6 December 2022 - 16:30',
          '2022-12-05T15:00:00'
        ),
        '2022-12-06T11:45:00'
      ),
    ]
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetReportedAdjudicationIssueData', {
      filter: { fromDate: '2022-12-05', toDate: '2022-12-05', locationId: null },
      response: { reportedAdjudications: [adjudicationResponse[0]] },
    })
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.resultsTable().find('tr').should('have.length', 3)
    const filter: DISFormsFilter = new DISFormsFilter()
    filter.forceFromDate(5, 12, 2022)
    filter.forceToDate(5, 12, 2022)
    filter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.confirmDISFormsIssued.root)
      expect(loc.search).to.eq('?fromDate=05%2F12%2F2022&toDate=05%2F12%2F2022&locationId=')
    })
  })
  it('should filter on the parameters given - dates and location', () => {
    const adjudicationResponse = [
      testData.completedAdjudication(
        12345,
        'G7234VB',
        testData.generateOtherData(
          'Smith, James',
          'James Smith',
          'TEST_GEN',
          'MDI-MCASU',
          '5 December 2022 - 11:11',
          '2022-12-05T11:11:00',
          '5 December 2022 - 15:00',
          '2022-12-05T15:00:00'
        ),
        '2022-12-05T10:45:00'
      ),
      testData.completedAdjudication(
        23456,
        'P3785CP',
        testData.generateOtherData(
          'Tovey, Peter',
          'Peter Tovey',
          'TEST_GEN',
          'MDI-RECP',
          '6 December 2022 - 12:10',
          '2022-12-06T11:11:00',
          '6 December 2022 - 16:30',
          '2022-12-05T15:00:00'
        ),
        '2022-12-06T11:45:00'
      ),
    ]
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    // initially returned data from api with only the default filters
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: adjudicationResponse } })
    // the data returned once the filter has been set
    cy.task('stubGetReportedAdjudicationIssueData', {
      response: { reportedAdjudications: adjudicationResponse },
      filter: { fromDate: '2022-12-04', toDate: '2022-12-06', locationId: 27102 },
    })
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.resultsTable().find('tr').should('have.length', 3)
    const filter: DISFormsFilter = new DISFormsFilter()
    filter.forceFromDate(4, 12, 2022)
    filter.forceToDate(6, 12, 2022)
    filter.selectLocation().select('Segregation MPU')
    filter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.confirmDISFormsIssued.root)
      expect(loc.search).to.eq('?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationId=27102')
    })
    confirmDISFormsIssued
      .resultsTable()
      .find('td')
      .then($headers => {
        expect($headers.get(0).innerText).to.contain('Tovey, Peter - P3785CP')
        expect($headers.get(1).innerText).to.contain('6 December 2022 - 11:45')
        expect($headers.get(2).innerText).to.contain('MDI-MCASU')
        expect($headers.get(3).innerText).to.contain('5 December 2022 - 15:00')
        expect($headers.get(4).innerText).to.contain('T. User')
        expect($headers.get(5).innerText).to.contain('Add date and time')
      })
  })
})