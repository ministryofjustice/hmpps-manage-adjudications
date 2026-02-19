import Page, { PageElement } from './page'

export default class AdjudicationsHistoryPage extends Page {
  constructor() {
    super('adjudication history')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="adjudication-history-no-entries"]')

  prisonerNameTitle = (): PageElement => cy.get('[data-qa="title"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().find('a.govuk-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (pageNumber: number): PageElement =>
    this.paginationLinks().filter(`[aria-label="Page ${pageNumber}"]`)

  paginationResults = (): PageElement => cy.get('body').find('.moj-pagination__results')

  card = (): PageElement => cy.get('[data-qa="adjudication-history-card"]')

  cardLinks = (): PageElement => cy.get('[data-qa="report-link"]')

  applyFilters = (): PageElement => cy.get('[data-qa="apply-filter-button"]')
}
