import IncidentStatement from '../pages/incidentStatement'
import Page from '../pages/page'

context('Incident Statement', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: {
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)' },
        categoryCode: 'C',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
      },
    })
    cy.task('stubStartNewDraftAdjudication', {
      draftAdjudication: {
        id: 3456,
        incidentDetails: {
          dateTimeOfIncident: '2021-11-03T11:09:42',
          locationId: 234,
        },
        prisonerNumber: 'G6415GD',
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      response: {
        draftAdjudication: {
          id: 3456,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 234,
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-11-09T13:51:37.241636',
          },
        },
      },
    })

    cy.task('stubPostDraftIncidentStatement', {
      id: 3456,
      response: {
        draftAdjudication: {
          id: 3456,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 234,
          },
          incidentStatement: {
            statement: 'John threw something at another prisoner',
          },
          prisonerNumber: 'G6415GD',
        },
      },
    })

    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(`/incident-statement/G6415GD/3456`)
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().should('exist')
    incidentStatementPage.statementRadios().should('exist')
    incidentStatementPage.submitButton().should('exist')
  })

  it('should show validation message if there is no statement given', () => {
    cy.visit(`/incident-statement/G6415GD/3456`)
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.radioYes().check()
    incidentStatementPage.submitButton().click()
    incidentStatementPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Write the full details of the alleged offence')
      })
  })
  it('should show validation message if a radio button was not chosen', () => {
    cy.visit(`/incident-statement/G6415GD/3456`)
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().type('This is my statement')
    incidentStatementPage.submitButton().click()
    incidentStatementPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select yes if you have completed your statement')
      })
  })
  it('should redirect the user to /check-your-answers if statement is complete', () => {
    cy.visit(`/incident-statement/G6415GD/3456`)
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().type('John was badly behaved today.')
    incidentStatementPage.radioYes().check()
    incidentStatementPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/check-your-answers/G6415GD/3456')
    })
  })
  it('should redirect the user to /place-the-prisoner-on-report if statement is incomplete', () => {
    cy.visit(`/incident-statement/G6415GD/3456`)
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().type('This is my statement, it is not finished.')
    incidentStatementPage.radioNo().check()
    incidentStatementPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/G6415GD/3456')
    })
  })
})
