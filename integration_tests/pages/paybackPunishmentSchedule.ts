import Page, { PageElement } from './page'

export default class PaybackPunishmentSchedulePage extends Page {
  constructor() {
    super('Punishment schedule')
  }

  summary = (): PageElement => cy.get('[data-qa="payback-punishment-summary"]')

  continue = (): PageElement => cy.get('[data-qa="submit"]')
}
