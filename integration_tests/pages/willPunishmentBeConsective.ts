import Page, { PageElement } from './page'

export default class WillPunishmentBeConsecutivePage extends Page {
  constructor() {
    super('Will this punishment be consecutive to another one given to')
  }

  consecutive = (): PageElement => cy.get('[data-qa="consecutive-radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
