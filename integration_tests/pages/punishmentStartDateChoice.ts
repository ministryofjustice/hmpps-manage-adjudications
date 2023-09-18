import Page, { PageElement } from './page'

export default class PunishmentStartDateChoicePage extends Page {
  constructor() {
    super('When will this punishment start?')
  }

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
