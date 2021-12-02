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
            createdByUserId: 'USER1',
            createdDateTime: '2021-11-17T09:40:00Z',
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
            createdByUserId: 'USER1',
            createdDateTime: '2021-11-17T11:40:00Z',
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
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G2996UX',
        response: {
          offenderNo: 'G2996UX',
          firstName: 'ABE',
          lastName: 'SMITH',
          assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)' },
          categoryCode: 'C',
          language: 'French',
          alerts: [
            { alertType: 'T', alertCode: 'TCPA' },
            { alertType: 'X', alertCode: 'XCU' },
          ],
        },
      })
      cy.task('stubGetPrisonerDetails', {
        prisonerNumber: 'G2996UP',
        response: {
          offenderNo: 'G2996UP',
          firstName: 'SANDY',
          lastName: 'BROOM',
          assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)' },
          categoryCode: 'C',
          language: 'German',
          alerts: [
            { alertType: 'T', alertCode: 'TCPA' },
            { alertType: 'X', alertCode: 'XCU' },
          ],
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`/select-report`)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.resultsTable().should('exist')
      continueReportSelectPage.noResultsMessage().should('not.exist')
    })
    it('should contain the correct incident details', () => {
      cy.visit(`/select-report`)
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
      cy.visit(`/select-report`)
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
      cy.visit(`/select-report`)
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
      cy.visit(`/select-report`)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.continueLink().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq('/place-the-prisoner-on-report/G2996UX/1')
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
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`/select-report`)
      const continueReportSelectPage: ContinueReportSelect = Page.verifyOnPage(ContinueReportSelect)

      continueReportSelectPage.resultsTable().should('not.exist')
      continueReportSelectPage.noResultsMessage().should('exist')
    })
  })
})
