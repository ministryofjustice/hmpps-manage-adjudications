import Page, { PageElement } from './page'

export default class PunishmentStartDatePage extends Page {
  constructor() {
    super('Enter the date the punishment will start')
  }

  datepicker = (): PageElement => cy.get('[data-qa="punishment-start-date-picker"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
