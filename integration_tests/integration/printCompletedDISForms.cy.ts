import moment from 'moment'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import PrintDISFormsFilter from '../pages/printDISFormsFilter'
import TestData from '../../server/routes/testutils/testData'
import PrintCompletedDISFormsPage from '../pages/printCompletedDISForms'
import { IssueStatus } from '../../server/data/ReportedAdjudicationResult'

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
  it('should have the required elements and expected default filter - no reports', () => {
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: [] } })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.printCompletedDisForms.root)
    const printCompletedDISFormsPage: PrintCompletedDISFormsPage = Page.verifyOnPage(PrintCompletedDISFormsPage)
    const filter: PrintDISFormsFilter = new PrintDISFormsFilter()
    printCompletedDISFormsPage.noResultsMessage().should('exist')
    printCompletedDISFormsPage.resultsTable().should('not.exist')
    filter.toDateInput().should('have.value', moment().format('DD/MM/YYYY'))
    filter.fromDateInput().should('have.value', moment().subtract(2, 'days').format('DD/MM/YYYY'))
    filter.selectLocation().should('have.value', '')
    filter.issuedCheckbox().should('be.checked')
    filter.notIssuedCheckbox().should('be.checked')
  })
  it('has working validation for the date filters', () => {
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: [] } })
    cy.task('stubGetBatchPrisonerDetails')
    cy.visit(adjudicationUrls.printCompletedDisForms.root)
    const filter: PrintDISFormsFilter = new PrintDISFormsFilter()
    filter.forceFromDate(5, 12, 2022)
    filter.forceToDate(3, 12, 2022)
    filter.applyButton().click()
    filter.filterBar().should('contain.text', 'Enter a date that is before or the same as the ‘date to’')
  })
  it.only('has working links to take the user to the print page for the adjudication', () => {
    const adjudicationResponse = [
      testData.completedAdjudication(12345, 'G7234VB', {
        displayName: 'Smith, James',
        friendlyName: 'James Smith',
        issuingOfficer: 'TEST_GEN',
        prisonerLocation: 'MDI-MCASU',
        dateTimeOfIssue: '2022-12-05T15:00:00',
        formsAlreadyIssued: true,
        hearings: [testData.singleHearing('2022-12-06T10:00:00')],
        issueStatus: IssueStatus.ISSUED,
        relevantAlerts: testData.alerts(['CSIP']),
      }),
    ]
    cy.task('stubGetReportedAdjudicationIssueData', { response: { reportedAdjudications: adjudicationResponse } })
    cy.task('stubGetBatchPrisonerDetails', [prisoners[0]])
    cy.task('stubGetPrisonersAlerts', {
      prisonerNumber: 'G7234VB',
      response: [{ alertCode: 'CSIP' }],
    })
    cy.visit(adjudicationUrls.printCompletedDisForms.root)
    const printCompletedDISFormsPage: PrintCompletedDISFormsPage = Page.verifyOnPage(PrintCompletedDISFormsPage)
    printCompletedDISFormsPage.printDISFormsLink(12345).should('exist')
    printCompletedDISFormsPage.printDISFormsLink(12345).click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.printReport.urls.start(12345))
    })
  })
})
