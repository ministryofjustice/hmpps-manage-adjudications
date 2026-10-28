import Page, { PageElement } from './page'

export default class PunishmentSchedulePage extends Page {
  constructor() {
    super('Punishment schedule')
  }

  punishmentName = (index: number): PageElement => cy.get(`[data-qa="punishment-name-${index}"]`)

  schedule = (index: number): PageElement => cy.get(`[data-qa="punishment-schedule-${index}"]`)

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancel = (): PageElement => cy.get('[data-qa="cancel"]')
}
