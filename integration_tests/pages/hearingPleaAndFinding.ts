import Page, { PageElement } from './page'

export default class HearingPleaAndFindingPage extends Page {
  constructor() {
    super('Plea and finding')
  }

  pleaRadioButtons = (): PageElement => cy.get('[data-qa="radio-plea"]')

  findingRadioButtons = (): PageElement => cy.get('[data-qa="radio-finding"]')

  submitButton = (): PageElement => cy.get('[data-qa="hearing-outcome-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  cancelButton = (): PageElement => cy.get('[data-qa="hearing-outcome-cancel"]')
}
