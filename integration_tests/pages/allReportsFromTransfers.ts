import Page, { PageElement } from './page'

export default class AllTransferReportsPage extends Page {
  constructor() {
    super('Reports for people transferred in or out')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().get('.moj-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (number: number): PageElement =>
    this.paginationLinks().contains(new RegExp(`^${number.toString()}$`))

  paginationResults = (): PageElement => cy.get('.moj-pagination__results').first()

  resultsTable = (): PageElement => cy.get('[data-qa="complete-adjudications-results-table"]')

  uncheckAllCheckboxes = () => cy.get('[type="checkbox"]').uncheck({ force: true })

  checkCheckboxWithValue = value => cy.get('[type="checkbox"]').check(value, { force: true })

  viewReportLink = () => cy.get('[data-qa="view-report-link"]')

  viewHearingsLink = () => cy.get('[data-qa="view-edit-hearing-link"]')
}
