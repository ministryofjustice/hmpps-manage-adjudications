import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import ConfirmedOnReport from '../pages/confirmedOnReportChangeReport'
import Page from '../pages/page'

const testData = new TestData()

context('Report has been changed', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: 1524493,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '1524493',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.confirmedOnReport.urls.confirmationOfChange('1524493'))
    Page.verifyOnPage(ConfirmedOnReport)
    cy.contains('John Smith’s report has been changed')
    cy.contains('What happens next')
    cy.contains('You will not get an email notification about this report.')
    cy.contains('Check your prison’s processes')
  })

  it('should redirect the user to your completed reports on finish', () => {
    cy.visit(adjudicationUrls.confirmedOnReport.urls.confirmationOfChange('1524493'))
    const confirmedOnReportPage = Page.verifyOnPage(ConfirmedOnReport)
    confirmedOnReportPage.finishLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
    })
  })
})
