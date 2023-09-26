import Page, { PageElement } from './page'

export default class ManualEntryConsecutivePunishmentErrorPage extends Page {
  constructor() {
    super('is not linked to a punishment of added days for this prisoner')
  }

  h1 = (): PageElement => cy.get('h1')

  info = (): PageElement => cy.get('[data-qa="para1"]')

  button = (): PageElement => cy.get('[data-qa="button"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')
}
