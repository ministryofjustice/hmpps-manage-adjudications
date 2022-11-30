import Page, { PageElement } from './page'

export default class PrisonerSearch extends Page {
  constructor() {
    super('Search for a prisoner to start a new report')
  }

  searchTermInput = (): PageElement => cy.get('[data-qa="prisoner-search-term-input"]')

  submitButton = (): PageElement => cy.get('[data-qa="prisoner-search-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  resultsTable = (): PageElement => cy.get('[data-qa="prisoner-search-results-table"]')

  resultsRows = (): PageElement => this.resultsTable().get('tbody tr')

  startReportLinks = (): PageElement => cy.get('[data-qa="start-report-link"]')
}
