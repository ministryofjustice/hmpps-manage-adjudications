import Page, { PageElement } from './page'

export default class ReportAQuashedGuiltyFindingPage extends Page {
  constructor() {
    super('Report a quashed guilty finding')
  }

  quashReason = (): PageElement => cy.get('#quashReason')

  quashDetails = (): PageElement => cy.get('[data-qa="quash-details"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
