import Page, { PageElement } from './page'

export default class CheckCreateOnBehalfOfPage extends Page {
  constructor() {
    super('Check your answers')
  }

  submitButton = (): PageElement => cy.get('[data-qa="create-on-behalf-of-confirm"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')
}
