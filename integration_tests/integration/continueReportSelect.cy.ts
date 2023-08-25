import { DraftAdjudication } from '../../server/data/DraftAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { generateRange } from '../../server/utils/utils'
import ContinueReportSelect from '../pages/continueReportSelect'
import Page from '../pages/page'

const testData = new TestData()
context('Continue a report - select report', () => {
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
      cy.visit(adjudicationUrls.continueReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.resultsTable().should('exist')
      continueReportSelectPage.noResultsMessage().should('not.exist')
    })
    it('should contain the correct header and data', () => {
      cy.visit(adjudicationUrls.continueReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage
        .resultsTable()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Charge number')
          expect($headings.get(1).innerText).to.contain('Discovery date and time')
          expect($headings.get(2).innerText).to.contain('Name and prison number')
        })

      continueReportSelectPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('1')
          expect($data.get(1).innerText).to.contain('14 November 2021 - 08:30')
          expect($data.get(2).innerText).to.contain('Smith, Abe - A1234AA')
          expect($data.get(3).innerText).to.contain('Continue report')
          expect($data.get(4).innerText).to.contain('Delete report')
        })
    })
    it('should take you to the task list for the report you wish to continue', () => {
      cy.visit(adjudicationUrls.continueReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.continueLink().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(1))
      })
    })
    it('should take you to deletion confirmation page', () => {
      cy.visit(adjudicationUrls.continueReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.deleteLink().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.deleteReport.urls.delete(1))
      })
    })
    it('pagination should work', () => {
      const manyDraftAdjudications: DraftAdjudication[] = generateRange(1, 300, _ => {
        return testData.draftAdjudication({
          id: _,
          prisonerNumber: 'A1234AA',
          dateTimeOfIncident: '2021-11-14T08:30:00',
        })
      })
      cy.task('stubGetAllDraftAdjudicationsForUser', { number: 0, allContent: manyDraftAdjudications }) // Page 1
      cy.task('stubGetAllDraftAdjudicationsForUser', { number: 9, allContent: manyDraftAdjudications }) // Page 10
      cy.task('stubGetAllReportedAdjudications', { number: 13, allContent: manyDraftAdjudications }) // Page 14

      // Page 1
      cy.visit(adjudicationUrls.continueReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)
      continueReportSelectPage.previousLink().should('not.exist')
      continueReportSelectPage.nextLink().should('exist')
      continueReportSelectPage.paginationResults().should('have.text', 'Showing 1 to 20 of 300 results')
      continueReportSelectPage.paginationLink(1).should('not.exist')
      continueReportSelectPage.paginationLink(10).should('exist')
      continueReportSelectPage.paginationLink(11).should('not.exist')
      // Page 10 - First
      continueReportSelectPage.paginationLink(10).first().click()
      continueReportSelectPage.previousLink().should('exist')
      continueReportSelectPage.nextLink().should('exist')
      continueReportSelectPage.paginationResults().should('have.text', 'Showing 181 to 200 of 300 results')
      continueReportSelectPage.paginationLink(10).should('not.exist')
      continueReportSelectPage.paginationLink(4).should('not.exist')
      continueReportSelectPage.paginationLink(5).should('exist')
      continueReportSelectPage.paginationLink(14).should('exist')
      continueReportSelectPage.paginationLink(15).should('not.exist')
    })
  })
  context('without data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetAllDraftAdjudicationsForUser', {})
      cy.task('stubGetBatchPrisonerDetails')
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.continueReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.resultsTable().should('not.exist')
      continueReportSelectPage.noResultsMessage().should('exist')
    })
  })
})
