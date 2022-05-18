import Page, { PageElement } from './page'

export default class ConfirmedOnReportPage extends Page {
  constructor() {
    super('has been submitted for review')
  }

  printLink = (): PageElement => cy.get('[data-qa="printLink"]')

  finishButton = (): PageElement => cy.get('[data-qa="confirmed-on-report-finish"]')
}
