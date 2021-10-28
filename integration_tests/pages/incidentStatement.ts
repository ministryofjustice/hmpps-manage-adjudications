import Page, { PageElement } from './page'

export default class IncidentStatementPage extends Page {
  constructor() {
    super('Incident statement')
  }

  statementTextArea = (): PageElement => cy.get('[data-qa="incident-statement-input"]')

  statementRadios = (): PageElement => cy.get('[data-qa="incident-statement-radios"]')

  radioYes = (): PageElement => cy.get('#incidentStatementComplete')

  radioNo = (): PageElement => cy.get('#incidentStatementComplete-2')

  submitButton = (): PageElement => cy.get('[data-qa="incident-statement-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
