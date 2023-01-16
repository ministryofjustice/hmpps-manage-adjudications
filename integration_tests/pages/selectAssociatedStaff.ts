import Page, { PageElement } from './page'

export default class SelectAssociatedStaff extends Page {
  constructor() {
    super('Select a staff member')
  }

  firstNameInput = (): PageElement => cy.get('[data-qa="search-first-name-input"]')

  lastNameInput = (): PageElement => cy.get('[data-qa="search-last-name-input"]')

  submitButton = (): PageElement => cy.get('[data-qa="search-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  nameSort = (): PageElement => cy.get('[data-qa="staff-name-sort"]')

  resultsTable = (): PageElement => cy.get('[data-qa="staffMember-search-results-table"]')

  resultsRows = (): PageElement => this.resultsTable().get('tbody tr')

  selectStaffMemberLink = (username: string): PageElement =>
    this.resultsTable().get(`[data-qa="select-staffMember-link-${username}"]`)

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
