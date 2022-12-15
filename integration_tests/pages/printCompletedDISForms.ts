import Page, { PageElement } from './page'

export default class PrintCompletedDISFormsPage extends Page {
  constructor() {
    super('Print completed DIS1/2 forms')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  resultsTable = (): PageElement => cy.get('[data-qa="results-table"]')

  printThisPageLink = (): PageElement => cy.get('[data-qa="printLink"]')

  printDISFormsLink = (adjudicationNumber: number): PageElement =>
    cy.get(`[data-qa="print-DIS1/2-${adjudicationNumber}"]`)
}
