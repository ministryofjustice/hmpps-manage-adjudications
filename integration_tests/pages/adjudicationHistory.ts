import Page, { PageElement } from './page'

export default class AdjudicationsHistoryPage extends Page {
  constructor() {
    super('adjudication history')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="adjudication-history-no-entries"]')

  prisonerNameTitle = (): PageElement => cy.get('[data-qa="title"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().get('.moj-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (number: number): PageElement =>
    this.paginationLinks().contains(new RegExp(`^${number.toString()}$`))

  paginationResults = (): PageElement => cy.get('.moj-pagination__results').first()

  card = (): PageElement => cy.get('[data-qa="adjudication-history-card"]')

  cardLinks = (): PageElement => cy.get('[data-qa="report-link"]')

  applyFilters = (): PageElement => cy.get('[data-qa="apply-filter-button"]')
}
