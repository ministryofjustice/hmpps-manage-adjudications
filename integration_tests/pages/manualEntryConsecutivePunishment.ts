import Page, { PageElement } from './page'

export default class ManualEntryConsecutivePunishmentPage extends Page {
  constructor() {
    super('Which charge will it be consecutive to?')
  }

  chargeNumber = (): PageElement => cy.get('input[id="consecutiveChargeNumber"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
