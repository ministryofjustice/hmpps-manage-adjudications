import Page, { PageElement } from './page'

export default class FormsTabPage extends Page {
  constructor() {
    super('Adjudication for charge')
  }

  printLink = (disNumber: string): PageElement => cy.get(`[data-qa="printDis${disNumber}"]`)

  noDis7Content = (): PageElement => cy.get('[data-qa="no-dis7-content"]')

  addIssueButton = (): PageElement => cy.get('[data-qa="add-issue-date-time"]')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  resultsTable = (): PageElement => cy.get('[data-qa="results-table"]')
}
