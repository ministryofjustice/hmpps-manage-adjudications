import Page, { PageElement } from './page'

export default class AssociatedPrisonerPage extends Page {
  constructor() {
    super('Who did John Smith assist?')
  }

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  searchButton = (): PageElement => cy.get('[data-qa="prisoner-search"]')

  submitButton = (): PageElement => cy.get('[data-qa="associated-prisoner-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  conditionalInputInternal = (): PageElement => cy.get('#prisonerSearchNameInput')

  associatedPrisonerDeleteButton = (): PageElement => cy.get('button[name="deleteUser"]')

  exitButton = (): PageElement => cy.get('[data-qa="associated-prisoner-exit"]')

  errorContinueButton = (): PageElement => cy.get('[data-qa="continue-after-error"]')

  externalNameInput = (): PageElement => cy.get('#prisonerOutsideEstablishmentNameInput')

  externalNumberInput = (): PageElement => cy.get('#prisonerOutsideEstablishmentNumberInput')

  internalNameInput = (): PageElement => cy.get('[data-qa="victim-prisoner-name"]')

  internalNumberInput = (): PageElement => cy.get('[data-qa="victim-prisoner-number"]')
}
