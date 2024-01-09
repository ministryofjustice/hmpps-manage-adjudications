import Page, { PageElement } from './page'

export default class ActivePunishmentsPage extends Page {
  constructor() {
    super('active punishments')
  }

  pageTitle = (): PageElement => cy.get('h1')

  punishmentsTable = (): PageElement => cy.get('[data-qa="active-punishments-table"]')

  link = (): PageElement => cy.get('[data-qa="adjudicationHistory-link"]')

  noPunishments = (): PageElement => cy.get('[data-qa="no-data"]')
}
