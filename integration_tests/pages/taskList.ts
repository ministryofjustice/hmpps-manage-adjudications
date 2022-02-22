import Page, { PageElement } from './page'

export default class CheckYourAnswersPage extends Page {
  constructor() {
    super('on report')
  }

  taskList = (): PageElement => cy.get('[data-qa="taskList"]')

  incidentDetailsLink = (): PageElement => cy.get('[data-qa="incident-details-link"]')

  offenceDetailsLink = (): PageElement => cy.get('[data-qa="offence-details-link"]')

  incidentStatementLink = (): PageElement => cy.get('[data-qa="incident-statement-link"]')

  acceptDetailsLink = (): PageElement => cy.get('[data-qa="accept-details-link"]')

  acceptDetailsText = (): PageElement => cy.get('[data-qa="accept-details-text"]')

  expirationNotice = (): PageElement => cy.get('[data-qa="expirationNotice"]')
}
