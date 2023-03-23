import Page, { PageElement } from './page'

export default class ContineReportSelect extends Page {
  constructor() {
    super('Continue a report')
  }

  resultsTable = (): PageElement => cy.get('[data-qa="continue-report-results-table"]')

  continueLink = (): PageElement => cy.get('[data-qa="continue-report-link-1"]')

  deleteLink = (): PageElement => cy.get('[data-qa="delete-report-link-1"]')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().get('.moj-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (number: number): PageElement =>
    this.paginationLinks().contains(new RegExp(`^${number.toString()}$`))

  paginationResults = (): PageElement => cy.get('.moj-pagination__results').first()
}
