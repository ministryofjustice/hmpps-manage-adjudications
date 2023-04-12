import Page, { PageElement } from './page'

export default class CheckPunishmentsPage extends Page {
  constructor() {
    super('Check your answers before submitting')
  }

  emptyState = (): PageElement => cy.get('[data-qa="emptyState"]')

  punishmentsTable = (): PageElement => cy.get('[data-qa="punishments-table"]')

  changePunishmentsLink = (): PageElement => cy.get('[data-qa="changePunishmentsLink"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishments-confirm"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')
}
