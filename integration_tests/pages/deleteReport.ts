import Page, { PageElement } from './page'

export default class DeleteReport extends Page {
  constructor() {
    super('Are you sure you want to delete this report?')
  }

  submitButton = (): PageElement => cy.get('[data-qa="delete-report-submit"]')

  cancelLink = (): PageElement => cy.get('[data-qa="delete-report-cancel"]')
}
