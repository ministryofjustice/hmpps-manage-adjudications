import Page, { PageElement } from './page'

export default class PunishmentNumberOfDaysAdditionalDaysPage extends Page {
  constructor() {
    super('Enter the number of additional days')
  }

  days = (): PageElement => cy.get('input[id="days"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
