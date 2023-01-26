import Page, { PageElement } from './page'

export default class EnterHearingOutcomePage extends Page {
  constructor() {
    super('Enter the hearing outcome')
  }

  adjudicatorName = (): PageElement => cy.get('[data-qa="adjudicator-name"]')

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="hearing-outcome-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  cancelButton = (): PageElement => cy.get('[data-qa="hearing-outcome-cancel"]')
}
