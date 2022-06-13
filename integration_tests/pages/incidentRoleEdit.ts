import Page, { PageElement } from './page'

export default class IncidentRoleEditPage extends Page {
  constructor() {
    super('What was John Smith’s role in this incident?')
  }

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  radioButtonLegend = (): PageElement => cy.get('legend')

  conditionalInputIncite = (): PageElement => cy.get('#incitedInput')

  conditionalInputAssist = (): PageElement => cy.get('#assistedInput')

  searchButtonIncite = (): PageElement => cy.get('[data-qa="incite-prisoner-search"]')

  searchButtonAssist = (): PageElement => cy.get('[data-qa="assist-prisoner-search"]')

  prisonerPrnAssist = (): PageElement => cy.get('[data-qa="assist-prisoner-prn"]')

  prisonerNameAssist = (): PageElement => cy.get('[data-qa="assist-prisoner-name"]')

  inciteAssociatedPrisonerDeleteButton = (): PageElement => cy.get('[data-qa="incite-prisoner-delete"]')

  submitButton = (): PageElement => cy.get('[data-qa="incident-role-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="incident-role-exit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  errorContinueButton = (): PageElement => cy.get('[data-qa="continue-after-error"]')
}
