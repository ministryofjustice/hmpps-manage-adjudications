import Page, { PageElement } from './page'

export default class ConfirmDISFormsIssuedPage extends Page {
  constructor() {
    super('Confirm notice of being placed on report was issued')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  resultsTable = (): PageElement => cy.get('[data-qa="results-table"]')

  addDateAndTimeLink = (number: number): PageElement => cy.get(`[data-qa="add-issue-date-time-link-${number}"]`)
}
