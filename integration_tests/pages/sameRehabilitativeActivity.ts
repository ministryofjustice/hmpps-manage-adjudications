import Page, { PageElement } from './page'

export default class SameRehabilitativeActivityPage extends Page {
  constructor() {
    super('Do they all have the same rehabilitative activity?')
  }

  sameForAll = (): PageElement => cy.get('[data-qa="same-activity-radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
