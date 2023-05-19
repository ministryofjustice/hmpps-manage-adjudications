import Page, { PageElement } from './page'

export default class ReviewerEditOffencesWarningPage extends Page {
  constructor() {
    super('Are you sure you want to change the offence?')
  }

  paragraph1 = (): PageElement => cy.get('[data-qa="p1"]')

  paragraph2 = (): PageElement => cy.get('[data-qa="p2"]')

  offenceDetailsSummary = (): PageElement => cy.get('[data-qa="offence-summary-table"]')

  continueButton = (): PageElement => cy.get('[data-qa="continue-button"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel-button"]')
}
