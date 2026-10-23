import Page, { PageElement } from './page'

export default class AwardPunishmentsPage extends Page {
  constructor() {
    super('Award punishments')
  }

  newPunishment = (): PageElement => cy.get('[data-qa="add-new-punishment-button"]')

  activateSuspendedPunishment = (): PageElement => cy.get('[data-qa="activate-suspended-punishment-button"]')

  punishmentsTable = (): PageElement => cy.get('[data-qa="punishments-table"]')

  activitiesTable = (): PageElement => cy.get('[data-qa="rehabilitative-activities-table"]')

  editPunishment = (): PageElement => cy.get('[data-qa="edit-punishment"]')

  deletePunishment = (): PageElement => cy.get('[data-qa="delete-punishment"]')

  changeActivity = (): PageElement => cy.get('[data-qa="edit-activity"]')

  removeActivity = (): PageElement => cy.get('[data-qa="delete-activity"]')

  continue = (): PageElement => cy.get('[data-qa="punishments-continue"]')

  successBanner = (): PageElement => cy.get('[data-qa="success-banner"]')

  addRehabilitativeActivity = (): PageElement => cy.get('[data-qa="add-rehabilitative-activity-button"]')
}
