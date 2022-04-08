import { selectReport, taskList } from '../../server/utils/urlGenerator'
import ContinueReportSelect from '../pages/continueReportSelect'
import Page from '../pages/page'

context('Continue a report - select report', () => {
  context('with data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetAllDraftAdjudicationsForUser', {
        draftAdjudications: [
          {
            startedByUserId: 'USER1',
            id: 1,
            incidentDetails: {
              dateTimeOfIncident: '2021-11-16T16:45:00',
              locationId: 233,
            },
            incidentStatement: {
              completed: false,
              statement: 'This is a test statement',
            },
            prisonerNumber: 'G2996UX',
          },
          {
            startedByUserId: 'USER1',
            id: 2,
            incidentDetails: {
              dateTimeOfIncident: '2021-11-14T08:30:00',
              locationId: 644,
            },
            incidentStatement: {
              completed: false,
              statement: 'This is a statement',
            },
            prisonerNumber: 'G2996UP',
          },
        ],
      })
      cy.task('stubGetBatchPrisonerDetails', [
        { offenderNo: 'G2996UX', firstName: 'ABE', lastName: 'SMITH' },
        { offenderNo: 'G2996UP', firstName: 'SANDY', lastName: 'BROOM' },
      ])
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.resultsTable().should('exist')
      continueReportSelectPage.noResultsMessage().should('not.exist')
    })
    it('should contain the correct incident details', () => {
      cy.visit(selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage
        .resultsTable()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Prisoner’s name')
          expect($headings.get(1).innerText).to.contain('Date of incident')
          expect($headings.get(2).innerText).to.contain('Time of incident')
        })

      continueReportSelectPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Broom, Sandy')
          expect($data.get(1).innerText).to.contain('14 November 2021')
          expect($data.get(2).innerText).to.contain('08:30')
          expect($data.get(3).innerText).to.contain('Continue')
          expect($data.get(4).innerText).to.contain('Smith, Abe')
          expect($data.get(5).innerText).to.contain('16 November 2021')
          expect($data.get(6).innerText).to.contain('16:45')
          expect($data.get(7).innerText).to.contain('Continue')
        })
    })
    it('should reorder the table entries when you manually sort on prisoner name', () => {
      cy.visit(selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.nameSort().click()

      continueReportSelectPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Smith, Abe')
          expect($data.get(1).innerText).to.contain('16 November 2021')
          expect($data.get(2).innerText).to.contain('16:45')
          expect($data.get(3).innerText).to.contain('Continue')
          expect($data.get(4).innerText).to.contain('Broom, Sandy')
          expect($data.get(5).innerText).to.contain('14 November 2021')
          expect($data.get(6).innerText).to.contain('08:30')
          expect($data.get(7).innerText).to.contain('Continue')
        })
    })
    it('should reorder the table entries when you manually sort on date', () => {
      cy.visit(selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.dateSort().click()

      continueReportSelectPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Smith, Abe')
          expect($data.get(1).innerText).to.contain('16 November 2021')
          expect($data.get(2).innerText).to.contain('16:45')
          expect($data.get(3).innerText).to.contain('Continue')
          expect($data.get(4).innerText).to.contain('Broom, Sandy')
          expect($data.get(5).innerText).to.contain('14 November 2021')
          expect($data.get(6).innerText).to.contain('08:30')
          expect($data.get(7).innerText).to.contain('Continue')
        })
    })
    it('should take you to the task list for the report you wish to continue', () => {
      cy.visit(selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.continueLink().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(`${taskList.urls.start(1)}`)
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
      cy.visit(selectReport.root)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.resultsTable().should('not.exist')
      continueReportSelectPage.noResultsMessage().should('exist')
    })
  })
})
