import { DraftAdjudication } from '../../server/data/DraftAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { generateRange } from '../../server/utils/utils'
import DeleteReport from '../pages/deleteReport'
import Page from '../pages/page'

const testData = new TestData()
context('Delete a report', () => {
  context('with data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      const manyDraftAdjudications: DraftAdjudication[] = generateRange(1, 20, _ => {
        return testData.draftAdjudication({
          id: _,
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2021-11-14T08:30:00',
        })
      })
      cy.task('stubGetAllDraftAdjudicationsForUser', { number: 0, allContent: manyDraftAdjudications }) // Page 1
      cy.task('stubGetBatchPrisonerDetails', [{ offenderNo: 'A1234AA', firstName: 'ABE', lastName: 'SMITH' }])
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

      deleteReportPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.continueReport.root)
      })
    })
  })
})
