import Page, { PageElement } from './page'

export default class AllTransferReportsPage extends Page {
  constructor() {
    super('Reports for people transferred in or out')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().find('a.govuk-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  transferredReportsAllTab = (): PageElement => cy.get('[data-qa="allTransfersTab"]')

  transferredReportsInTab = (): PageElement => cy.get('[data-qa="transferInTab"]')

  transferredReportsOutTab = (): PageElement => cy.get('[data-qa="transferOutTab"]')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (pageNumber: number): PageElement =>
    this.paginationLinks().filter(`[aria-label="Page ${pageNumber}"]`)

  paginationResults = (): PageElement => cy.get('.moj-pagination__results').first()

  resultsTable = (): PageElement => cy.get('[data-qa="results-table"]')

  uncheckAllCheckboxes = () => cy.get('[type="checkbox"]').uncheck()

  checkCheckboxWithValue = value => cy.get('[type="checkbox"]').check(value)

  viewReportLink = () => cy.get('[data-qa="view-report-link"]')
}
