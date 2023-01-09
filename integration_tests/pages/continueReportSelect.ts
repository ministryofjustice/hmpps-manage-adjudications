import Page, { PageElement } from './page'

export default class ContineReportSelect extends Page {
  constructor() {
    super('Continue a report')
  }

  resultsTable = (): PageElement => cy.get('[data-qa="continue-report-results-table"]')

  continueLink = (): PageElement => cy.get('[data-qa="continue-report-link-1"]')

  nameSort = (): PageElement => cy.get('[data-qa="prisoner-name-sort"]')

  dateSort = (): PageElement => cy.get('[data-qa="date-sort"]')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
