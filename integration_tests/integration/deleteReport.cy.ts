import adjudicationUrls from '../../server/utils/urlGenerator'
import DeleteReport from '../pages/deleteReport'
import Page from '../pages/page'

context('Delete a report', () => {
  context('with data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.deleteReport.urls.delete(0))
      const deleteReportPage: DeleteReport = Page.verifyOnPage(DeleteReport)

      deleteReportPage.submitButton().should('exist')
      deleteReportPage.submitButton().should('exist')
    })
    it('should be able to cancel report deletion', () => {
      cy.visit(adjudicationUrls.deleteReport.urls.delete(0))
      const deleteReportPage: DeleteReport = Page.verifyOnPage(DeleteReport)

      deleteReportPage.cancelButton().click()

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
