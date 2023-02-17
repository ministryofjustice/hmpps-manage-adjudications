import Page, { PageElement } from './page'

export default class NotProceedPage extends Page {
  constructor() {
    super('What is the reason for not proceeding?')
  }

  notProceedReason = (): PageElement => cy.get('#notProceedReason')

  notProceedDetails = (): PageElement => cy.get('[data-qa="not-proceed-details"]')

  submitButton = (): PageElement => cy.get('[data-qa="not-proceed-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="not-proceed-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
