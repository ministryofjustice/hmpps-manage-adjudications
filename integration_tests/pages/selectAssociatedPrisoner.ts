import Page, { PageElement } from './page'

export default class SelectAssociatedStaff extends Page {
  constructor() {
    super('Select a prisoner')
  }

  searchTermInput = (): PageElement => cy.get('[data-qa="search-term-input"]')

  submitButton = (): PageElement => cy.get('[data-qa="search-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  resultsTable = (): PageElement => cy.get('[data-qa="prisoner-search-results-table"]')

  resultsRows = (): PageElement => this.resultsTable().get('tbody tr')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
