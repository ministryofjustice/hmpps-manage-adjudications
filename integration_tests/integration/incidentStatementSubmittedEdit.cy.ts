import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import IncidentStatement from '../pages/incidentStatementSubmittedEdit'
import Page from '../pages/page'

const testData = new TestData()

context('Incident Statement', () => {
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
    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 3456,
          chargeNumber: '1524493',
          prisonerNumber: 'G6415GD',
          locationId: 197682,
          dateTimeOfIncident: '2021-12-09T10:30:00',
          incidentStatement: {
            statement: 'This is the statement',
            completed: true,
          },
        }),
      },
    })

    cy.task('stubPutDraftIncidentStatement', {
      id: 3456,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 3456,
          chargeNumber: '1524493',
          prisonerNumber: 'G6415GD',
          locationId: 197682,
          dateTimeOfIncident: '2021-12-09T10:30:00',
          incidentStatement: {
            statement: 'The prisoner was badly behaved today.',
            completed: true,
          },
        }),
      },
    })

    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.incidentStatement.urls.submittedEdit(3456))
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().should('exist')
    incidentStatementPage.submitButton().should('exist')
    incidentStatementPage.cancelButton().should('exist')
  })

  it('should show validation message if there is no statement given', () => {
    cy.visit(adjudicationUrls.incidentStatement.urls.submittedEdit(3456))
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().clear()
    incidentStatementPage.submitButton().click()
    incidentStatementPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the details of the incident')
      })
  })
  it('should redirect the user to /check-your-answers if statement is complete', () => {
    cy.visit(adjudicationUrls.incidentStatement.urls.submittedEdit(3456))
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().clear()
    incidentStatementPage.statementTextArea().type('The prisoner was badly behaved today.')
    incidentStatementPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.checkYourAnswers.urls.report(3456))
    })
  })
  it('should redirect the user to prisoner report if the user clicks cancel', () => {
    cy.visit(adjudicationUrls.incidentStatement.urls.submittedEdit(3456))
    const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
    incidentStatementPage.statementTextArea().clear()
    incidentStatementPage.cancelButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(1524493))
    })
  })
})
