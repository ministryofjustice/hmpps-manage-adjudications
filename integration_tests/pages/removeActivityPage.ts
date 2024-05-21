import Page, { PageElement } from './page'

export default class RemoveActivityPage extends Page {
  constructor() {
    super('Are you sure you want to delete this rehabilitative activity?')
  }

  submitButton = (): PageElement => cy.get('[data-qa="delete-activity-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="delete-activity-cancel"]')
}
