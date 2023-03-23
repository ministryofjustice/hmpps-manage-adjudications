import Page, { PageElement } from './page'

export default class ContineReportSelect extends Page {
  constructor() {
    super('Continue a report')
  }

  submitButton = (): PageElement => cy.get('[data-qa="delete-report-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="delete-report-cancel"]')
}
