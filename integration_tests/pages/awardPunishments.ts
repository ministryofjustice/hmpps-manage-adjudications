import Page, { PageElement } from './page'

export default class AwardPunishmentsPage extends Page {
  constructor() {
    super('Award punishments')
  }

  newPunishment = (): PageElement => cy.get('[data-qa="add-new-punishment-button"]')

  punishmentsTable = (): PageElement => cy.get('[data-qa="punishments-table"]')

  editPunishment = (): PageElement => cy.get('[data-qa="edit-punishment"]')

  deletePunishment = (): PageElement => cy.get('[data-qa="delete-punishment"]')
}
