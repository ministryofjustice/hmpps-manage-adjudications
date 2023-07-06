import Page, { PageElement } from './page'

export default class WillPunishmentBeSuspendedPage extends Page {
  constructor() {
    super('Will this punishment be suspended?')
  }

  suspended = (): PageElement => cy.get('[data-qa="suspended-radio-buttons"]')

  suspendedUntil = (): PageElement => cy.get('[data-qa="suspended-until-date-picker"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
