import moment from 'moment'
import ViewScheduledHearingsPage from '../pages/viewScheduledHearings'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { formatDateForDatePicker } from '../../server/utils/utils'

const formattedDate = moment().format('DD/MM/YYYY')
const testData = new TestData()

const prisoners = [
  testData.prisonerResultSummary({ offenderNo: 'G6345BY', firstName: 'EMMANUEL', lastName: 'SALGADO' }),
  testData.prisonerResultSummary({ offenderNo: 'P3785CP', firstName: 'ROSEMARY', lastName: 'KIRK' }),
  testData.prisonerResultSummary({ offenderNo: 'D9543CY', firstName: 'YUNUS', lastName: 'WHITEHEAD' }),
  testData.prisonerResultSummary({ offenderNo: 'M1876DT', firstName: 'MALLORY', lastName: 'BARNETT' }),
]

const hearingsSetOne = [
  {
    ...testData.singleHearing({
      dateTimeOfHearing: '2025-11-05T13:00:00',
      id: 1,
    }),
    dateTimeOfDiscovery: '2025-11-03T14:00:00',
    chargeNumber: '123456',
    prisonerNumber: 'G6345BY',
    status: ReportedAdjudicationStatus.CHARGE_PROVED,
  },
  {
    ...testData.singleHearing({
      dateTimeOfHearing: '2025-11-05T14:00:00',
      id: 4,
    }),
    dateTimeOfDiscovery: '2025-11-04T09:00:00',
    chargeNumber: '123456',
    prisonerNumber: 'P3785CP',
    status: ReportedAdjudicationStatus.ADJOURNED,
  },
]
const hearingsSetTwo = [
  {
    ...testData.singleHearing({
      dateTimeOfHearing: '2025-11-06T10:00:00',
      id: 2,
    }),
    dateTimeOfDiscovery: '2025-11-03T14:00:00',
    chargeNumber: '567894',
    prisonerNumber: 'D9543CY',
    status: ReportedAdjudicationStatus.DISMISSED,
  },
  {
    ...testData.singleHearing({
      dateTimeOfHearing: '2025-11-06T11:00:00',
      id: 3,
    }),
    dateTimeOfDiscovery: '2025-11-04T09:00:00',
    chargeNumber: '678912',
    prisonerNumber: 'M1876DT',
    status: ReportedAdjudicationStatus.ADJOURNED,
  },
]

context('View scheduled hearings', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })

    cy.signIn()
  })
  it('should have the required elements on the page', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: moment().format('YYYY-MM-DD'),
      response: { hearings: hearingsSetOne },
    })
    cy.task('stubGetBatchPrisonerDetails', prisoners)

    cy.visit(adjudicationUrls.viewScheduledHearings.root)
    const viewScheduledHearingsPage: ViewScheduledHearingsPage = Page.verifyOnPage(ViewScheduledHearingsPage)
    viewScheduledHearingsPage.datePicker().should('exist')
    viewScheduledHearingsPage.applyButton().should('exist')
    viewScheduledHearingsPage.clearLink().should('exist')
    viewScheduledHearingsPage.viewReportLink(1).should('exist')
    viewScheduledHearingsPage.viewOrEditHearingLink(1).should('exist')
    viewScheduledHearingsPage.viewReportLink(2).should('exist')
    viewScheduledHearingsPage.viewOrEditHearingLink(2).should('exist')
    viewScheduledHearingsPage.hearingTable().should('exist')
    viewScheduledHearingsPage.noResultsMessage().should('not.exist')
  })
  it('should show the no hearings message if there are no scheduled hearings on that day', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: moment().format('YYYY-MM-DD'),
      response: { hearings: [] },
    })
    cy.task('stubGetBatchPrisonerDetails')

    cy.visit(adjudicationUrls.viewScheduledHearings.root)
    const viewScheduledHearingsPage: ViewScheduledHearingsPage = Page.verifyOnPage(ViewScheduledHearingsPage)
    viewScheduledHearingsPage.noResultsMessage().should('exist')
    viewScheduledHearingsPage.datePicker().should('have.value', formattedDate)
    viewScheduledHearingsPage.hearingTable().should('not.exist')
  })
  it('should have the correct details showing in the table', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: moment().format('YYYY-MM-DD'),
      response: { hearings: hearingsSetOne },
    })
    cy.task('stubGetBatchPrisonerDetails', prisoners)

    cy.visit(adjudicationUrls.viewScheduledHearings.root)
    const viewScheduledHearingsPage: ViewScheduledHearingsPage = Page.verifyOnPage(ViewScheduledHearingsPage)
    const date = formatDateForDatePicker(new Date('11/5/2025').toISOString(), 'short')
    viewScheduledHearingsPage.datePicker().clear().type(date)

    viewScheduledHearingsPage
      .hearingTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Charge number')
        expect($headings.get(1).innerText).to.contain('Hearing date and time')
        expect($headings.get(2).innerText).to.contain('Name and prison number')
        expect($headings.get(3).innerText).to.contain('Adjudication status')
        expect($headings.get(4).innerText).to.contain('')
        expect($headings.get(5).innerText).to.contain('')
      })
    viewScheduledHearingsPage
      .hearingTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('123456')
        expect($data.get(1).innerText).to.contain('5 November 2025 - 13:00')
        expect($data.get(2).innerText).to.contain('Salgado, Emmanuel - G6345BY')
        expect($data.get(3).innerText).to.contain('Charge proved')
        expect($data.get(4).innerText).to.contain('View hearing')
        expect($data.get(5).innerText).to.contain('View report')
        expect($data.get(6).innerText).to.contain('123456')
        expect($data.get(7).innerText).to.contain('5 November 2025 - 14:00')
        expect($data.get(8).innerText).to.contain('Kirk, Rosemary - P3785CP')
        expect($data.get(9).innerText).to.contain('Adjourned')
        expect($data.get(10).innerText).to.contain('View hearing')
        expect($data.get(11).innerText).to.contain('View report')
      })
    viewScheduledHearingsPage.viewReportLink(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(123456))
    })
    cy.visit(adjudicationUrls.viewScheduledHearings.root)
    viewScheduledHearingsPage.viewOrEditHearingLink(1).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('123456'))
    })
  })
  it('should accept a user-chosen date (using datepicker)', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      response: { hearings: [] },
    })
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: '2025-11-06',
      response: { hearings: hearingsSetTwo },
    })
    cy.task('stubGetBatchPrisonerDetails', [])
    cy.task('stubGetBatchPrisonerDetails', prisoners)

    cy.visit(adjudicationUrls.viewScheduledHearings.root)
    const viewScheduledHearingsPage: ViewScheduledHearingsPage = Page.verifyOnPage(ViewScheduledHearingsPage)
    const date = formatDateForDatePicker(new Date('11/6/2025').toISOString(), 'short')
    viewScheduledHearingsPage.datePicker().clear().type(date)
    viewScheduledHearingsPage.applyButton().click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.viewScheduledHearings.urls.start())
      expect(loc.search).to.eq('?hearingDate=06%2F11%2F2025')
    })
    Page.verifyOnPage(ViewScheduledHearingsPage)
    viewScheduledHearingsPage
      .hearingTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('567894')
        expect($data.get(1).innerText).to.contain('6 November 2025 - 10:00')
        expect($data.get(2).innerText).to.contain('Whitehead, Yunus - D9543CY')
        expect($data.get(3).innerText).to.contain('Dismissed')
        expect($data.get(4).innerText).to.contain('View hearing')
        expect($data.get(5).innerText).to.contain('View report')
        expect($data.get(6).innerText).to.contain('678912')
        expect($data.get(7).innerText).to.contain('6 November 2025 - 11:00')
        expect($data.get(8).innerText).to.contain('Barnett, Mallory - M1876DT')
        expect($data.get(9).innerText).to.contain('Adjourned')
        expect($data.get(10).innerText).to.contain('View hearing')
        expect($data.get(11).innerText).to.contain('View report')
      })
  })
  it('should clear the filter when the link is clicked', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: '2025-11-05',
      response: { hearings: [] },
    })
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      response: { hearings: [] },
    })
    cy.task('stubGetBatchPrisonerDetails', [])

    cy.visit(adjudicationUrls.viewScheduledHearings.urls.filter('05/11/2025'))
    const viewScheduledHearingsPage: ViewScheduledHearingsPage = Page.verifyOnPage(ViewScheduledHearingsPage)
    viewScheduledHearingsPage.clearLink().click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.viewScheduledHearings.urls.start())
      expect(loc.search).to.eq('')
    })
  })
  it('should handle if some prisoner information is missing', () => {
    cy.task('stubGetHearingsGivenAgencyAndDate', {
      hearingDate: moment().format('YYYY-MM-DD'),
      response: { hearings: hearingsSetOne },
    })
    cy.task('stubGetBatchPrisonerDetails', [prisoners[0]])

    cy.visit(adjudicationUrls.viewScheduledHearings.root)
    const viewScheduledHearingsPage: ViewScheduledHearingsPage = Page.verifyOnPage(ViewScheduledHearingsPage)
    const date = formatDateForDatePicker(new Date('11/5/2025').toISOString(), 'short')
    viewScheduledHearingsPage.datePicker().clear().type(date)

    viewScheduledHearingsPage
      .hearingTable()
      .find('th')
      .then($headings => {
        expect($headings.get(0).innerText).to.contain('Charge number')
        expect($headings.get(1).innerText).to.contain('Hearing date and time')
        expect($headings.get(2).innerText).to.contain('Name and prison number')
        expect($headings.get(3).innerText).to.contain('Adjudication status')
        expect($headings.get(4).innerText).to.contain('')
        expect($headings.get(5).innerText).to.contain('')
      })
    viewScheduledHearingsPage
      .hearingTable()
      .find('td')
      .then($data => {
        expect($data.get(0).innerText).to.contain('123456')
        expect($data.get(1).innerText).to.contain('5 November 2025 - 13:00')
        expect($data.get(2).innerText).to.contain('Salgado, Emmanuel - G6345BY')
        expect($data.get(3).innerText).to.contain('Charge proved')
        expect($data.get(4).innerText).to.contain('View hearing')
        expect($data.get(5).innerText).to.contain('View report')
        expect($data.get(6).innerText).to.contain('123456')
        expect($data.get(7).innerText).to.contain('5 November 2025 - 14:00')
        expect($data.get(8).innerText).to.contain('Unknown - P3785CP')
        expect($data.get(9).innerText).to.contain('Adjourned')
        expect($data.get(10).innerText).to.contain('View hearing')
        expect($data.get(11).innerText).to.contain('View report')
      })
  })
})
