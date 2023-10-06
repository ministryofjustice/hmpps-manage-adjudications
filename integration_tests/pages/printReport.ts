import Page, { PageElement } from './page'

export default class PrintReportPage extends Page {
  constructor() {
    super('Print notice of being placed on report (DIS 1 and 2)')
  }

  printLink = (disNumber: string): PageElement => cy.get(`[data-qa="printDis${disNumber}"]`)

  exitButton = (): PageElement => cy.get('[data-qa="print-report-exit"]')
}
