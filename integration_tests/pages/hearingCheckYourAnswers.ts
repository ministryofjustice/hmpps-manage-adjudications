import Page, { PageElement } from './page'

export default class HearingCheckAnswersPage extends Page {
  constructor() {
    super('Check your answers before submitting')
  }

  answersTable = (): PageElement => cy.get('[data-qa="money-caution-summary"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelLink = (): PageElement => cy.get('[data-qa="cancel"]')
}
