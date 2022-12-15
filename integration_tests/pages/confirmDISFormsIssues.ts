import Page, { PageElement } from './page'

export default class ConfirmDISFormsIssuedPage extends Page {
  constructor() {
    super('Confirm DIS 1/2 has been issued to prisoner')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  resultsTable = (): PageElement => cy.get('[data-qa="results-table"]')

  addDateAndTimeLink = (number: number): PageElement => cy.get(`[data-qa="add-issue-date-time-link-${number}"]`)
}
