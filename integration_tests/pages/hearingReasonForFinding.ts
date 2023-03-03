import Page, { PageElement } from './page'

export default class HearingReasonForFinding extends Page {
  constructor() {
    super('What is the reason for this finding?')
  }

  findingReason = (): PageElement => cy.get('[data-qa="finding-details"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')
}
