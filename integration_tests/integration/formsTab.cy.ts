import moment from 'moment/moment'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import FormsTabPage from '../pages/formsTab'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import AddDateAndTimeOfIssue from '../pages/addDateAndTimeOfIssue'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()
const reportedAdjudication = testData.reportedAdjudication({
  chargeNumber: '100',
  prisonerNumber: 'G6123VU',
  status: ReportedAdjudicationStatus.CHARGE_PROVED,
  dateTimeOfIssue: '2022-12-05T15:00:00',
  issuingOfficer: 'USER1',
  punishments: [],
  hearings: [
    testData.singleHearing({
      dateTimeOfHearing: '2024-11-23T17:00:00',
      id: 68,
    }),
  ],
  disIssueHistory: [
    {
      issuingOfficer: 'USER1',
      dateTimeOfIssue: '2022-12-03T13:00:00',
    },
    {
      issuingOfficer: 'USER1',
      dateTimeOfIssue: '2022-12-04T14:00:00',
    },
  ],
})

const reportedAdjudication2 = testData.reportedAdjudication({
  chargeNumber: '101',
  prisonerNumber: 'G6123VU',
  status: ReportedAdjudicationStatus.CHARGE_PROVED,
  dateTimeOfIssue: '2022-12-05T15:00:00',
  issuingOfficer: 'USER1',
  punishments: [testData.punishmentWithSchedule({})],
  hearings: [
    testData.singleHearing({
      dateTimeOfHearing: '2024-11-23T17:00:00',
      id: 68,
    }),
  ],
  disIssueHistory: [
    {
      issuingOfficer: 'USER1',
      dateTimeOfIssue: '2022-12-03T13:00:00',
    },
    {
      issuingOfficer: 'USER1',
      dateTimeOfIssue: '2022-12-04T14:00:00',
    },
  ],
})

context('Navigated to forms tab', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication,
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: reportedAdjudication2,
      },
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6123VU',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6123VU',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetBatchPrisonerDetails', [testData.simplePrisoner('G6123VU', 'JAMES', 'SMITH', 'MDI-RECP')])
    cy.task('stubGetIssueDataDiscDate', {
      filter: { fromDate: moment().subtract(6, 'months').format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD') },
      response: { reportedAdjudications: [] },
    })
    cy.signIn()
  })

  describe('Loads', () => {
    it('should contain the required page elements for DIS12 tab - no outcomes', () => {
      cy.visit(adjudicationUrls.forms.urls.view('100'))
      const formsTabPage = Page.verifyOnPage(FormsTabPage)
      formsTabPage
        .printLink('DIS1-staff')
        .should('have.attr', 'href')
        .and('include', `${adjudicationUrls.printPdf.urls.dis12('100')}?copy=staff`)
      formsTabPage
        .printLink('DIS1-prisoner')
        .should('have.attr', 'href')
        .and('include', `${adjudicationUrls.printPdf.urls.dis12('100')}?copy=prisoner`)
      formsTabPage.addIssueButton().should('exist')
    })
    it('should contain the required page elements for forms for hearing - no outcomes', () => {
      cy.visit(adjudicationUrls.forms.urls.view('100'))
      const formsTabPage = Page.verifyOnPage(FormsTabPage)
      formsTabPage
        .printLink('DIS3-auto')
        .should('have.attr', 'href')
        .and('include', `${adjudicationUrls.printPdf.urls.dis3('100')}`)
      formsTabPage
        .printLink('DIS3-type')
        .should('have.attr', 'href')
        .and('include', `/assets/pdf/DIS%203%20-%20input%20version.pdf`)
      formsTabPage
        .printLink('DIS4-auto')
        .should('have.attr', 'href')
        .and('include', `${adjudicationUrls.printPdf.urls.dis4('100')}`)
      formsTabPage
        .printLink('DIS4-type')
        .should('have.attr', 'href')
        .and('include', `/assets/pdf/DIS%204%20-%20input.pdf`)
      formsTabPage
        .printLink('DIS5')
        .should('have.attr', 'href')
        .and('include', `${adjudicationUrls.printPdf.urls.dis5('100')}`)
      formsTabPage
        .printLink('DIS6-auto')
        .should('have.attr', 'href')
        .and('include', `${adjudicationUrls.printPdf.urls.dis6('100')}`)
      formsTabPage
        .printLink('DIS6-type')
        .should('have.attr', 'href')
        .and('include', `/assets/pdf/DIS%206%20-%20input.pdf`)
      formsTabPage
        .printLink('DIS7-blank')
        .should('have.attr', 'href')
        .and('include', `${adjudicationUrls.printPdf.urls.dis7Blank('100')}`)
      formsTabPage.noDis7Content().should('exist')
    })
    it('should contain the required page elements - punishments present', () => {
      cy.visit(adjudicationUrls.forms.urls.view('101'))
      const formsTabPage = Page.verifyOnPage(FormsTabPage)
      formsTabPage
        .printLink('DIS7-auto')
        .should('have.attr', 'href')
        .and('include', `${adjudicationUrls.printPdf.urls.dis7('101')}`)
      formsTabPage.noDis7Content().should('not.exist')
    })

    it('should display table with records of issuing dis 1/2 to prisoner', () => {
      cy.task('stubGetIssueDataDiscDate', {
        filter: {
          fromDate: moment().subtract(6, 'months').format('YYYY-MM-DD'),
          toDate: moment().format('YYYY-MM-DD'),
        },
        response: { reportedAdjudications: [reportedAdjudication] },
      })

      cy.visit(adjudicationUrls.forms.urls.view('100'))
      const formsTabPage = Page.verifyOnPage(FormsTabPage)
      formsTabPage.printLink('DIS1-staff')
      formsTabPage.printLink('DIS1-prisoner')
      formsTabPage.printLink('DIS3-auto')
      formsTabPage.printLink('DIS4-auto')
      formsTabPage.printLink('DIS5')
      formsTabPage.printLink('DIS6-auto')
      formsTabPage.printLink('DIS7-blank')
      formsTabPage.noResultsMessage().should('not.exist')
      formsTabPage
        .resultsTable()
        .find('th')
        .then($headers => {
          expect($headers.get(0).innerText).to.contain('Issue date and time')
          expect($headers.get(1).innerText).to.contain('Issuing officer')
        })
      formsTabPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('3 December 2022 - 13:00')
          expect($data.get(1).innerText).to.contain('T. User')
          expect($data.get(2).innerText).to.contain('4 December 2022 - 14:00')
          expect($data.get(3).innerText).to.contain('T. User')
          expect($data.get(4).innerText).to.contain('5 December 2022 - 15:00')
          expect($data.get(5).innerText).to.contain('T. User')
        })
      formsTabPage.addIssueButton().should('exist')
    })

    it('should redirect to the forms tab page on successful submit of issue date time', () => {
      cy.visit(adjudicationUrls.forms.urls.view('100'))
      const formsTabPage = Page.verifyOnPage(FormsTabPage)
      formsTabPage.addIssueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.addIssueDateTime.urls.start('100'))
      })

      const addDateTimeOfIssuePage: AddDateAndTimeOfIssue = Page.verifyOnPage(AddDateAndTimeOfIssue)
      const date = new Date()
      const yesterday = formatDateForDatePicker(new Date(date.setDate(date.getDate() - 1)).toISOString(), 'short')
      addDateTimeOfIssuePage.dateInput().type(yesterday)
      addDateTimeOfIssuePage.hourInput().type('20')
      addDateTimeOfIssuePage.minutesInput().type('30')
      addDateTimeOfIssuePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.forms.urls.view('100'))
      })
    })
  })
})
