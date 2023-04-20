import Page, { PageElement } from './page'

export default class EnterHearingOutcomePage extends Page {
  constructor() {
    super('Enter the hearing outcome')
  }

  governorName = (): PageElement => cy.get('[data-qa="governor-name"]')

  inAdName = (): PageElement => cy.get('[data-qa="independent-adjudicator-name"]')

  searchButton = (): PageElement => cy.get('[data-qa="gov-search"]')

  chosenGovernorName = (): PageElement => cy.get('[data-qa="chosen-governor-name"]')

  chosenGovernorId = (): PageElement => cy.get('[data-qa="chosen-governor-id"]')

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="hearing-outcome-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  cancelButton = (): PageElement => cy.get('[data-qa="hearing-outcome-cancel"]')
}
