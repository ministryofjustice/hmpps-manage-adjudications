import Page, { PageElement } from './page'

export default class SelectAssociatedStaff extends Page {
  constructor() {
    super('Select a staff member')
  }

  nameInput = (): PageElement => cy.get('[data-qa="search-name-input"]')

  submitButton = (): PageElement => cy.get('[data-qa="search-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  nameSort = (): PageElement => cy.get('[data-qa="staff-name-sort"]')

  resultsTable = (): PageElement => cy.get('[data-qa="staffMember-search-results-table"]')

  resultsRows = (): PageElement => this.resultsTable().get('tbody tr')

  selectStaffMemberLink = (username: string): PageElement =>
    this.resultsTable().get(`[data-qa="select-staffMember-link-${username}"]`)

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
