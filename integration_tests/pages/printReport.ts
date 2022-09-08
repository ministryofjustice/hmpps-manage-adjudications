import Page, { PageElement } from './page'

export default class PrintReportPage extends Page {
  constructor() {
    super('Print this report')
  }

  printButton = (): PageElement => cy.get('[data-qa="print-report-button"]')

  exitButton = (): PageElement => cy.get('[data-qa="print-report-exit"]')
}
