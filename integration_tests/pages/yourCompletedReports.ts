import Page, { PageElement } from './page'

export default class YourCompletedReportsPage extends Page {
  constructor() {
    super('Your completed reports')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="adjudication-reports-no-entries"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().find('a.govuk-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (pageNumber: number): PageElement =>
    this.paginationLinks().filter(`[aria-label="Page ${pageNumber}"]`)

  paginationResults = (): PageElement => cy.get('.moj-pagination__results').first()

  card = (): PageElement => cy.get('[data-qa="adjudication-report-card"]')

  checkCheckboxWithValue = value => cy.get('[type="checkbox"]').check(value)

  dateOfSubmission = (): PageElement => cy.get('[data-qa="date-of-submission"]')

  dateOfDiscovery = (): PageElement => cy.get('[data-qa="date-of-discovery"]')

  locationDescription = (): PageElement => cy.get('[data-qa="location-description"]')

  prisonerNameAndNumber = (): PageElement => cy.get('[data-qa="prisoner-name-number"]')

  offenceDescription = (): PageElement => cy.get('[data-qa="offence-description"]')

  status = (): PageElement => cy.get('[data-qa="adjudication-status"]')

  applyButton = () => cy.get('[data-qa="apply-filter-button"]')

  viewReportLink = () => cy.get('[data-qa="report-link"]')
}
