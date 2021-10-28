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
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(`/incident-statement`)
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().should('exist')
    incidentStatementPage.statementRadios().should('exist')
    incidentStatementPage.submitButton().should('exist')
  })

  it('should show validation message if there is no statement given', () => {
    cy.visit(`/incident-statement`)
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
    cy.visit(`/incident-statement`)
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
    cy.visit(`/incident-statement`)
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().type('This is my statement')
    incidentStatementPage.radioYes().check()
    incidentStatementPage.submitButton().click()
    cy.url().should('include', 'check-your-answers')
  })
  it('should redirect the user to /place-a-prisoner-on-report if statement is incomplete', () => {
    cy.visit(`/incident-statement`)
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().type('This is my statement, it is not finished.')
    incidentStatementPage.radioNo().check()
    incidentStatementPage.submitButton().click()
    cy.url().should('include', 'place-a-prisoner-on-report')
  })
})
