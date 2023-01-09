import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import ContinueReportSelect from '../pages/continueReportSelect'
import Page from '../pages/page'

const testData = new TestData()
context('Continue a report - select report', () => {
  context('with data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetAllDraftAdjudicationsForUser', {
        draftAdjudications: [
          testData.draftAdjudication({
            prisonerNumber: 'G2996UX',
            dateTimeOfDiscovery: '2022-11-16T16:45:00',
            id: 1,
          }),
          testData.draftAdjudication({
            prisonerNumber: 'G2996UP',
            dateTimeOfDiscovery: '2022-11-14T08:30:00',
            id: 2,
          }),
        ],
      })
      cy.task('stubGetBatchPrisonerDetails', [
        { offenderNo: 'G2996UX', firstName: 'ABE', lastName: 'SMITH' },
        { offenderNo: 'G2996UP', firstName: 'SANDY', lastName: 'BROOM' },
      ])
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.resultsTable().should('exist')
      continueReportSelectPage.noResultsMessage().should('not.exist')
    })
    it('should contain the correct incident details', () => {
      cy.visit(adjudicationUrls.selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage
        .resultsTable()
        .find('th')
        .then($headings => {
          expect($headings.get(1).innerText).to.contain('Discovery date and time')
          expect($headings.get(0).innerText).to.contain('Name and prison number')
        })

      continueReportSelectPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(1).innerText).to.contain('14 November 2022 - 08:30')
          expect($data.get(0).innerText).to.contain('Broom, Sandy - G2996UP')
          expect($data.get(2).innerText).to.contain('Continue report')
          expect($data.get(4).innerText).to.contain('16 November 2022 - 16:45')
          expect($data.get(3).innerText).to.contain('Smith, Abe - G2996UX')
          expect($data.get(5).innerText).to.contain('Continue report')
        })
    })
    it('should reorder the table entries when you manually sort on prisoner name', () => {
      cy.visit(adjudicationUrls.selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.nameSort().click()

      continueReportSelectPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(1).innerText).to.contain('16 November 2022 - 16:45')
          expect($data.get(0).innerText).to.contain('Smith, Abe - G2996UX')
          expect($data.get(2).innerText).to.contain('Continue report')
          expect($data.get(4).innerText).to.contain('14 November 2022 - 08:30')
          expect($data.get(3).innerText).to.contain('Broom, Sandy - G2996UP')
          expect($data.get(5).innerText).to.contain('Continue report')
        })
    })
    it('should reorder the table entries when you manually sort on date', () => {
      cy.visit(adjudicationUrls.selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.dateSort().click()

      continueReportSelectPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(4).innerText).to.contain('16 November 2022 - 16:45')
          expect($data.get(3).innerText).to.contain('Smith, Abe - G2996UX')
          expect($data.get(5).innerText).to.contain('Continue report')
          expect($data.get(1).innerText).to.contain('14 November 2022 - 08:30')
          expect($data.get(0).innerText).to.contain('Broom, Sandy - G2996UP')
          expect($data.get(2).innerText).to.contain('Continue report')
        })
    })
    it('should take you to the task list for the report you wish to continue', () => {
      cy.visit(adjudicationUrls.selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.continueLink().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(1))
      })
    })
  })
  context('without data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetAllDraftAdjudicationsForUser', {
        draftAdjudications: [],
      })
      cy.task('stubGetBatchPrisonerDetails', [])
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.resultsTable().should('not.exist')
      continueReportSelectPage.noResultsMessage().should('exist')
    })
  })
})
