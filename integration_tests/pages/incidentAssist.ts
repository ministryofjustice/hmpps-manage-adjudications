import Page, { PageElement } from './page'

export default class IncidentAssistPage extends Page {
  constructor() {
    super('Who did John Smith assist?')
  }

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  searchButton = (): PageElement => cy.get('[data-qa="prisoner-search"]')

  submitButton = (): PageElement => cy.get('[data-qa="incident-assist-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  conditionalInputInternalAssist = (): PageElement => cy.get('#prisonerSearchNameInput')

  assistAssociatedPrisonerDeleteButton = (): PageElement => cy.get('button[name="deleteUser"]')

  exitButton = (): PageElement => cy.get('[data-qa="incident-assist-exit"]')

  errorContinueButton = (): PageElement => cy.get('[data-qa="continue-after-error"]')

  externalNameInput = (): PageElement => cy.get('#prisonerOutsideEstablishmentNameInput')

  externalNumberInput = (): PageElement => cy.get('#prisonerOutsideEstablishmentNumberInput')

  internalNameInput = (): PageElement => cy.get('[data-qa="victim-prisoner-name"]')

  internalNumberInput = (): PageElement => cy.get('[data-qa="victim-prisoner-number"]')
}
