import Page, { PageElement } from './page'

export default class AllCompletedReportsPage extends Page {
  constructor() {
    super('Adjudications')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().get('.moj-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (number: number): PageElement =>
    this.paginationLinks().contains(new RegExp(`^${number.toString()}$`))

  paginationResults = (): PageElement => cy.get('.moj-pagination__results').first()

  resultsTable = (): PageElement => cy.get('[data-qa="complete-adjudications-results-table"]')

  uncheckAllCheckboxes = () => cy.get('[type="checkbox"]').uncheck()

  checkCheckboxWithValue = value => cy.get('[type="checkbox"]').check(value)
}