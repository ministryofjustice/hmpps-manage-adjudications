import Page, { PageElement } from './page'

export default class IncidentRolePage extends Page {
  constructor() {
    super('What was John Smith’s role in this incident?')
  }

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="incident-role-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  exitButton = (): PageElement => cy.get('[data-qa="incident-role-exit"]')

  errorContinueButton = (): PageElement => cy.get('[data-qa="continue-after-error"]')
}
