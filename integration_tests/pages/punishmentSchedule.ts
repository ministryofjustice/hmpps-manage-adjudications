import Page, { PageElement } from './page'

export default class PunishmentSchedulePage extends Page {
  constructor() {
    super('Punishment schedule')
  }

  days = (): PageElement => cy.get('input[id="days"]')

  suspended = (): PageElement => cy.get('[data-qa="suspended-radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-schedule-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="punishment-schedule-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
