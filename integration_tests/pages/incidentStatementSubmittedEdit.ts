import Page, { PageElement } from './page'

export default class IncidentStatementPage extends Page {
  constructor() {
    super('Incident statement')
  }

  statementTextArea = (): PageElement => cy.get('[data-qa="incident-statement-input"]')

  submitButton = (): PageElement => cy.get('[data-qa="incident-statement-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="incident-statement-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
