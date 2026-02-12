import Page, { PageElement } from './page'

export default class ContineReportSelect extends Page {
  constructor() {
    super('Continue a report')
  }

  resultsTable = (): PageElement => cy.get('[data-qa="continue-report-results-table"]')

  continueLink = (): PageElement => cy.get('[data-qa="continue-report-link-1"]')

  deleteLink = (): PageElement => cy.get('[data-qa="delete-report-link-1"]')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().find('a.govuk-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (pageNumber: number): PageElement =>
    this.paginationLinks().filter(`[aria-label="Page ${pageNumber}"]`)

  paginationResults = (): PageElement => cy.get('body').find('.moj-pagination__results')
}
