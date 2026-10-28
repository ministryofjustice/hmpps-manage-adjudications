import Page, { PageElement } from './page'

export default class PunishmentSameDurationPage extends Page {
  constructor() {
    super('Do they all have the same duration and start date?')
  }

  sameForAll = (): PageElement => cy.get('[data-qa="same-duration-radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
