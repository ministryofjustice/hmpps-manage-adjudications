import Page, { PageElement } from './page'

export default class CheckCreateOnBehalfOfPage extends Page {
  constructor(createdOnBehalfOfOfficer: string) {
    super(`Why are you creating this report for ${createdOnBehalfOfOfficer}`)
  }

  behalfOfReason = (): PageElement => cy.get('[data-qa="behalf-of-reason"]')

  submitButton = (): PageElement => cy.get('[data-qa="create-on-behalf-of-continue"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
