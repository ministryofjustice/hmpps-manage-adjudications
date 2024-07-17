import Page, { PageElement } from './page'

export default class AllCompletedReportsPage extends Page {
  constructor() {
    super('Reports from')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="adjudication-reports-no-entries"]')

  paginationLinks = (): PageElement => cy.get('.moj-pagination').first().get('.moj-pagination__link')

  previousLink = (): PageElement => this.paginationLinks().contains('Previous')

  nextLink = (): PageElement => this.paginationLinks().contains('Next')

  paginationLink = (number: number): PageElement =>
    this.paginationLinks().contains(new RegExp(`^${number.toString()}$`))

  paginationResults = (): PageElement => cy.get('.moj-pagination__results').first()

  card = (): PageElement => cy.get('[data-qa="adjudication-report-card"]')

  dateOfDiscovery = (): PageElement => cy.get('[data-qa="date-of-discovery"]')

  submissionDate = (): PageElement => cy.get('[data-qa="date-of-submission"]')

  locationDescription = (): PageElement => cy.get('[data-qa="location-description"]')

  prisonerNameAndNumber = (): PageElement => cy.get('[data-qa="prisoner-name-number"]')

  offenceDescription = (): PageElement => cy.get('[data-qa="offence-description"]')

  reportingOfficerName = (): PageElement => cy.get('[data-qa="reporting-officer-name"]')

  status = (): PageElement => cy.get('[data-qa="adjudication-status"]')

  checkCheckboxWithValue = value => cy.get('[type="checkbox"]').check(value)

  viewReportLink = () => cy.get('[data-qa="report-link"]')

  applyButton = () => cy.get('[data-qa="apply-filter-button"]')
}
