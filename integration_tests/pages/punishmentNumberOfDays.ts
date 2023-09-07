import Page, { PageElement } from './page'

export default class PunishmentNumberOfDaysPage extends Page {
  constructor() {
    super('Enter the number of days this punishment will last')
  }

  days = (): PageElement => cy.get('input[id="days"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-number-of-days-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="punishment-number-of-days-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
