import Page, { PageElement } from './page'

export default class PunishmentAutomaticEndDatesPage extends Page {
  constructor() {
    super('Punishment schedule')
  }

  name = (): PageElement => cy.get('[data-qa="punishment-name"]')

  summary = (): PageElement => cy.get('[data-qa="punishment-dates-summary"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')
}
