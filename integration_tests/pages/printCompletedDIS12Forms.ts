import Page, { PageElement } from './page'

export default class PrintCompletedDISFormsPage extends Page {
  constructor() {
    super('Print notice of being placed on report (DIS 1 and 2)')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')

  resultsTable = (): PageElement => cy.get('[data-qa="results-table"]')

  printThisPageLink = (): PageElement => cy.get('[data-qa="printLink"]')

  printDISFormsLink = (chargeNumber: string): PageElement => cy.get(`[data-qa="print-DIS1/2-${chargeNumber}"]`)
}
