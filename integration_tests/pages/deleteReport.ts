import Page, { PageElement } from './page'

export default class DeleteReport extends Page {
  constructor() {
    super('Delete report')
  }

  submitButton = (): PageElement => cy.get('[data-qa="delete-report-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="delete-report-cancel"]')
}
