import Page, { PageElement } from './page'

export default class TaskListPage extends Page {
  constructor() {
    super('on report')
  }

  taskList = (): PageElement => cy.get('[data-qa="taskList"]')

  incidentDetailsLink = (): PageElement => cy.get('[data-qa="incident-details-link"]')

  offenceDetailsLink = (): PageElement => cy.get('[data-qa="details-of-offence-link"]')

  damagesLink = (): PageElement => cy.get('[data-qa="damages-link"]')

  evidenceLink = (): PageElement => cy.get('[data-qa="evidence-link"]')

  witnessesLink = (): PageElement => cy.get('[data-qa="witnesses-link"]')

  incidentStatementLink = (): PageElement => cy.get('[data-qa="incident-statement-link"]')

  acceptDetailsLink = (): PageElement => cy.get('[data-qa="accept-details-link"]')

  acceptDetailsText = (): PageElement => cy.get('[data-qa="accept-details-text"]')

  expirationNotice = (): PageElement => cy.get('[data-qa="expirationNotice"]')
}
