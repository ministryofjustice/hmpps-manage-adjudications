import Page, { PageElement } from './page'

export default class SuspendedPunishmentSchedule extends Page {
  constructor() {
    super('Punishment schedule')
  }

  days = (): PageElement => cy.get('input[id="days"]')

  startDate = (): PageElement => cy.get('[data-qa="start-date-picker"]')

  endDate = (): PageElement => cy.get('[data-qa="end-date-picker"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-schedule-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="punishment-schedule-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
