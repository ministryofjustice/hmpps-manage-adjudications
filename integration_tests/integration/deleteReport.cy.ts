import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import DeleteReport from '../pages/deleteReport'
import Page from '../pages/page'

const testData = new TestData()

context('Delete a report', () => {
  context('with data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetDraftAdjudication', {
        id: 0,
        response: {
          draftAdjudication: testData.draftAdjudication({
            id: 0,
            prisonerNumber: 'G6415GD',
          }),
        },
      })
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G6415GD',
        response: testData.prisonerResultSummary({
          offenderNo: 'G6415GD',
          firstName: 'JOHN',
          lastName: 'SMITH',
        }),
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.deleteReport.urls.delete(0))
      const deleteReportPage: DeleteReport = Page.verifyOnPage(DeleteReport)

      deleteReportPage.submitButton().should('exist')
      deleteReportPage.cancelLink().should('exist')
    })
    it('should be able to cancel report deletion', () => {
      cy.visit(adjudicationUrls.deleteReport.urls.delete(0))
      const deleteReportPage: DeleteReport = Page.verifyOnPage(DeleteReport)

      deleteReportPage.cancelLink().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.continueReport.root)
      })
    })
    it('should delete report', () => {
      cy.visit(adjudicationUrls.deleteReport.urls.delete(0))
      const deleteReportPage: DeleteReport = Page.verifyOnPage(DeleteReport)

      cy.task('stubDeleteReport', { id: 0, response: null })
      deleteReportPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.continueReport.root)
      })
    })
  })
})
