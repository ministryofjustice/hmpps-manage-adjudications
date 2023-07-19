import Page, { PageElement } from './page'

export default class WhichPunishmentConsecutiveToPage extends Page {
  constructor() {
    super('Which punishment will it be consecutive to?')
  }

  emptyDataPara = (): PageElement => cy.get('[data-qa="no-data"]')

  table = (): PageElement => cy.get('[data-qa="consecutive-punishments-table"]')

  selectButton = (): PageElement => cy.get('[data-qa="select-button"]')

  enterManuallyLink = (): PageElement => cy.get('[data-qa="enter-manually-link"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')
}
