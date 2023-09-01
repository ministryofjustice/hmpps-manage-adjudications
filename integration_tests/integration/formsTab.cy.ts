import moment from 'moment/moment'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import FormsTabPage from '../pages/formsTab'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import AddDateAndTimeOfIssue from '../pages/addDateAndTimeOfIssue'
import { forceDateInputWithDate } from '../componentDrivers/dateInput'

const testData = new TestData()
const reportedAdjudication = testData.reportedAdjudication({
  chargeNumber: '100',
  prisonerNumber: 'G6123VU',
  status: ReportedAdjudicationStatus.CHARGE_PROVED,
  dateTimeOfIssue: '2022-12-05T15:00:00',
  issuingOfficer: 'USER1',
  hearings: [
    testData.singleHearing({
      dateTimeOfHearing: '2024-11-23T17:00:00',
      id: 68,
    }),
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
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication,
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
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.forms.urls.review('100'))
      const formsTabPage = Page.verifyOnPage(FormsTabPage)
      formsTabPage.printLink('12')
      // formsTabPage.printLink('3')
      // formsTabPage.printLink('4')
      formsTabPage.printLink('5')
      formsTabPage.printLink('6')
      formsTabPage.printLink('7')
      formsTabPage.noResultsMessage().should('exist')
      formsTabPage.addIssueButton().should('exist')
    })

    it('should display table with records of issuing dis 1/2 to prisoner', () => {
      cy.task('stubGetIssueDataDiscDate', {
        filter: {
          fromDate: moment().subtract(6, 'months').format('YYYY-MM-DD'),
          toDate: moment().format('YYYY-MM-DD'),
        },
        response: { reportedAdjudications: [reportedAdjudication] },
      })

      cy.visit(adjudicationUrls.forms.urls.review('100'))
      const formsTabPage = Page.verifyOnPage(FormsTabPage)
      formsTabPage.printLink('12')
      // formsTabPage.printLink('3')
      // formsTabPage.printLink('4')
      formsTabPage.printLink('5')
      formsTabPage.printLink('6')
      formsTabPage.printLink('7')
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
          expect($data.get(0).innerText).to.contain('5 December 2022 - 15:00')
          expect($data.get(1).innerText).to.contain('T. User')
        })
      formsTabPage.addIssueButton().should('exist')
    })

    it('should redirect to the forms tab page on successful submit of issue date time', () => {
      cy.visit(adjudicationUrls.forms.urls.review('100'))
      const formsTabPage = Page.verifyOnPage(FormsTabPage)
      formsTabPage.addIssueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.addIssueDateTime.urls.start('100'))
      })

      const addDateTimeOfIssuePage: AddDateAndTimeOfIssue = Page.verifyOnPage(AddDateAndTimeOfIssue)
      const date = new Date()
      const yesterday = new Date(date.setDate(date.getDate() - 1))
      forceDateInputWithDate(yesterday, '[data-qa="issued-date"]')
      addDateTimeOfIssuePage.hourInput().type('20')
      addDateTimeOfIssuePage.minutesInput().type('30')
      addDateTimeOfIssuePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.forms.urls.review('100'))
      })
    })
  })
})
