import Page, { PageElement } from './page'

export default class ActivateSuspendedPunishmentsPage extends Page {
  constructor() {
    super('Activate an existing suspended punishment')
  }

  subheading = (): PageElement => cy.get('[data-qa="subheading"]')

  suspendedPunishmentsTable = (): PageElement => cy.get('[data-qa="activate-suspended-punishments-table"]')

  activatePunishmentButton = (): PageElement => cy.get('[data-qa="activate-button"]')

  enterManuallyLink = (): PageElement => cy.get('[data-qa="enter-manually-link"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')
}
