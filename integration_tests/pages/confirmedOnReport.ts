import Page, { PageElement } from './page'

export default class ConfirmedOnReportPage extends Page {
  constructor() {
    super('has been placed on report')
  }

  printLink = (): PageElement => cy.get('[data-qa="printLink"]')

  feedbackLink = (): PageElement => cy.get('[data-qa="feedback-link"]')

  finishButton = (): PageElement => cy.get('[data-qa="confirmed-on-report-finish"]')
}
