import moment from 'moment'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DISFormsFilter from '../pages/DISFormsFilter'
import TestData from '../../server/routes/testutils/testData'
import ConfirmDISFormsIssuedPage from '../pages/confirmDISFormsIssues'
import { formatDateForDatePicker } from '../../server/utils/utils'

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
      response: testData.userFromUsername('TEST_GEN'),
    })
    cy.signIn()
  })

  it('should have the required elements - no reports', () => {
    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: [] } })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.noResultsMessage().should('exist')
    confirmDISFormsIssued.resultsTable().should('not.exist')
  })
  it('has the expected default date range', () => {
    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: [] } })
    cy.task('stubGetBatchPrisonerDetails')

    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const filter: DISFormsFilter = new DISFormsFilter()
    filter.toDateInput().should('have.value', moment().format('DD/MM/YYYY'))
    filter.fromDateInput().should('have.value', moment().subtract(2, 'days').format('DD/MM/YYYY'))
  })
  it('has working validation for the date filters', () => {
    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: [] } })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const filter: DISFormsFilter = new DISFormsFilter()
    const fromDate = formatDateForDatePicker(new Date('12/5/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('12/3/2022').toISOString(), 'short')
    filter.fromDateInput().clear().type(fromDate)
    filter.toDateInput().clear().type(toDate)
    filter.applyButton().click()
    filter.filterBar().should('contain.text', 'Enter a date that is before or the same as the ‘date to’')
  })
  it('has working links to add date and time of issue', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIssue: '2022-12-05T15:00:00',
      }),

      testData.reportedAdjudication({
        chargeNumber: '23456',
        prisonerNumber: 'G7234VB',
      }),
    ]
    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetBatchPrisonerDetails', [prisoners[0]])
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.addDateAndTimeLink(1).should('exist')
    confirmDISFormsIssued.addDateAndTimeLink(2).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.addIssueDateTime.urls.start('23456'))
    })
  })
  it('should have the required elements - reports present but not issued', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIncident: '2022-12-05T11:11:00',
      }),
      testData.reportedAdjudication({
        chargeNumber: '23456',
        prisonerNumber: 'P3785CP',
        dateTimeOfIncident: '2022-12-06T12:10:00',
      }),
    ]

    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.noResultsMessage().should('not.exist')
    confirmDISFormsIssued
      .resultsTable()
      .find('th')
      .then($headers => {
        expect($headers.get(0).innerText).to.contain('Charge number')
        expect($headers.get(1).innerText).to.contain('Name and prison number')
        expect($headers.get(2).innerText).to.contain('Discovery date and time')
        expect($headers.get(3).innerText).to.contain('Prisoner location')
        expect($headers.get(4).innerText).to.contain('Last issued')
        expect($headers.get(5).innerText).to.contain('Issuing officer')
        expect($headers.get(6).innerText).to.contain('')
      })
    confirmDISFormsIssued
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('23456')
        expect($data.get(1).innerText).to.contain('Tovey, Peter - P3785CP')
        expect($data.get(2).innerText).to.contain('6 December 2022 - 12:10')
        expect($data.get(3).innerText).to.contain('MDI-MCASU')
        expect($data.get(4).innerText).to.contain('-')
        expect($data.get(5).innerText).to.contain('-')
        expect($data.get(6).innerText).to.contain('Add date and time')
        expect($data.get(7).innerText).to.contain('12345')
        expect($data.get(8).innerText).to.contain('Smith, James - G7234VB')
        expect($data.get(9).innerText).to.contain('5 December 2022 - 11:11')
        expect($data.get(10).innerText).to.contain('MDI-RECP')
        expect($data.get(11).innerText).to.contain('-')
        expect($data.get(12).innerText).to.contain('-')
        expect($data.get(13).innerText).to.contain('Add date and time')
      })
  })
  it('should show the date and time of issuing, as the issuing officer if data is present, and contain a link to re-issue another date and time', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIncident: '2022-12-05T11:11:00',
        issuingOfficer: 'TEST_GEN',
        dateTimeOfIssue: '2022-12-05T15:00:00',
      }),
    ]
    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.noResultsMessage().should('not.exist')
    confirmDISFormsIssued
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('12345')
        expect($data.get(1).innerText).to.contain('Smith, James - G7234VB')
        expect($data.get(2).innerText).to.contain('5 December 2022 - 11:11')
        expect($data.get(3).innerText).to.contain('MDI-RECP')
        expect($data.get(4).innerText).to.contain('5 December 2022 - 15:00')
        expect($data.get(5).innerText).to.contain('T. User')
        expect($data.get(6).innerText).to.contain('Add date and time')
      })
  })
  it('should handle if the prisoner details cannot be found', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIncident: '2022-12-05T11:11:00',
        issuingOfficer: 'TEST_GEN',
        dateTimeOfIssue: '2022-12-05T15:00:00',
      }),
    ]
    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetBatchPrisonerDetails', [])
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.noResultsMessage().should('not.exist')
    confirmDISFormsIssued
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('12345')
        expect($data.get(1).innerText).to.contain('Unknown - G7234VB')
        expect($data.get(2).innerText).to.contain('5 December 2022 - 11:11')
        expect($data.get(3).innerText).to.contain('Unknown')
        expect($data.get(4).innerText).to.contain('5 December 2022 - 15:00')
        expect($data.get(5).innerText).to.contain('T. User')
        expect($data.get(6).innerText).to.contain('Add date and time')
      })
  })
  it('should filter on the parameters given - dates only', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIncident: '2022-12-05T11:11:00',
        dateTimeOfIssue: '2022-12-05T15:00:00',
        issuingOfficer: 'TEST_GEN',
      }),
      testData.reportedAdjudication({
        chargeNumber: '23456',
        prisonerNumber: 'P3785CP',
        dateTimeOfIncident: '2022-12-05T12:10:00',
        issuingOfficer: 'TEST_GEN',
        dateTimeOfIssue: '2022-12-06T16:30:00',
      }),
    ]
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetIssueDataDiscDate', {
      filter: { fromDate: '2022-12-05', toDate: '2022-12-05', locationId: null },
      response: { reportedAdjudications: [adjudicationResponse[0]] },
    })
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.resultsTable().find('tr').should('have.length', 3)
    const filter: DISFormsFilter = new DISFormsFilter()
    const date = formatDateForDatePicker(new Date('12/5/2022').toISOString(), 'short')
    filter.fromDateInput().clear().type(date)
    filter.toDateInput().clear().type(date)
    filter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.confirmDISFormsIssued.root)
      expect(loc.search).to.eq('?fromDate=05%2F12%2F2022&toDate=05%2F12%2F2022&locationId=')
    })
  })
  it('should filter on the parameters given - dates and location', () => {
    const adjudicationResponse = [
      testData.reportedAdjudication({
        chargeNumber: '12345',
        prisonerNumber: 'G7234VB',
        dateTimeOfIncident: '2022-12-05T11:11:00',
        issuingOfficer: 'TEST_GEN',
        dateTimeOfIssue: '2022-12-05T15:00:00',
      }),
      testData.reportedAdjudication({
        chargeNumber: '23456',
        prisonerNumber: 'P3785CP',
        dateTimeOfIncident: '2022-12-06T11:11:00',
        issuingOfficer: 'TEST_GEN',
        dateTimeOfIssue: '2022-12-06T16:30:00',
      }),
    ]
    cy.task('stubGetBatchPrisonerDetails', prisoners)
    // initially returned data from api with only the default filters
    cy.task('stubGetIssueDataDiscDate', { response: { reportedAdjudications: adjudicationResponse } })
    // the data returned once the filter has been set
    cy.task('stubGetIssueDataDiscDate', {
      response: { reportedAdjudications: adjudicationResponse },
      filter: { fromDate: '2022-12-04', toDate: '2022-12-06', locationId: 27102 },
    })
    cy.visit(adjudicationUrls.confirmDISFormsIssued.root)
    const confirmDISFormsIssued: ConfirmDISFormsIssuedPage = Page.verifyOnPage(ConfirmDISFormsIssuedPage)
    confirmDISFormsIssued.resultsTable().find('tr').should('have.length', 3)
    const filter: DISFormsFilter = new DISFormsFilter()
    const fromDate = formatDateForDatePicker(new Date('12/4/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('12/6/2022').toISOString(), 'short')
    filter.fromDateInput().clear().type(fromDate)
    filter.toDateInput().clear().type(toDate)
    filter.selectLocation().select('Segregation MPU')
    filter.applyButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.confirmDISFormsIssued.root)
      expect(loc.search).to.eq('?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationId=27102')
    })
    confirmDISFormsIssued
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('23456')
        expect($data.get(1).innerText).to.contain('Tovey, Peter - P3785CP')
        expect($data.get(2).innerText).to.contain('6 December 2022 - 11:11')
        expect($data.get(3).innerText).to.contain('MDI-MCASU')
        expect($data.get(4).innerText).to.contain('6 December 2022 - 16:30')
        expect($data.get(5).innerText).to.contain('T. User')
        expect($data.get(6).innerText).to.contain('Add date and time')
      })
  })
})
