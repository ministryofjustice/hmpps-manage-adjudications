import Page, { PageElement } from './page'

export default class ReasonForChangePunishmentPage extends Page {
  constructor() {
    super('What is the reason for this change?')
  }

  radios = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  details = (): PageElement => cy.get('[data-qa="detailsOfChange"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
