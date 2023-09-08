import Page, { PageElement } from './page'

export default class PunishmentIsSuspendedPage extends Page {
  constructor() {
    super('Is this punishment suspended?')
  }

  suspended = (): PageElement => cy.get('[data-qa="suspended-radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
