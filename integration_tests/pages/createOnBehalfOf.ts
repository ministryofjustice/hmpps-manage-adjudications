import Page, { PageElement } from './page'

export default class CheckCreateOnBehalfOfPage extends Page {
  constructor() {
    super('Enter the new reporting officers name')
  }

  officersName = (): PageElement => cy.get('[data-qa="officers-name"]')

  submitButton = (): PageElement => cy.get('[data-qa="create-on-behalf-of-continue"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
