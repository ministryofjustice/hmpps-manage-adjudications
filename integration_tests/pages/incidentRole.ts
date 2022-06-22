import Page, { PageElement } from './page'

export default class IncidentRolePage extends Page {
  constructor() {
    super('What was John Smith’s role in this incident?')
  }

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  conditionalInputIncite = (): PageElement => cy.get('#incitedInput')

  conditionalInputAssist = (): PageElement => cy.get('#assistedInput')

  searchButtonIncite = (): PageElement => cy.get('[data-qa="incite-prisoner-search"]')

  searchButtonAssist = (): PageElement => cy.get('[data-qa="assist-prisoner-search"]')

  submitButton = (): PageElement => cy.get('[data-qa="incident-role-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  inciteAssociatedPrisonerDeleteButton = (): PageElement => cy.get('[data-qa="incite-prisoner-delete"]')

  exitButton = (): PageElement => cy.get('[data-qa="incident-role-exit"]')

  errorContinueButton = (): PageElement => cy.get('[data-qa="continue-after-error"]')
}
