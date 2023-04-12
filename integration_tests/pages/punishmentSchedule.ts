import Page, { PageElement } from './page'

export default class PunishmentSchedulePage extends Page {
  constructor() {
    super('Punishment schedule')
  }

  days = (): PageElement => cy.get('input[id="days"]')

  suspended = (): PageElement => cy.get('[data-qa="suspended-radio-buttons"]')

  suspendedUntil = (): PageElement => cy.get('[data-qa="suspended-until-date-picker"]')

  startDate = (): PageElement => cy.get('[data-qa="start-date-picker"]')

  endDate = (): PageElement => cy.get('[data-qa="end-date-picker"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-schedule-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="punishment-schedule-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
