import Page, { PageElement } from './page'

export default class PaybackPunishmentSpecificsPage extends Page {
  constructor() {
    super('Do you have the details of the payback punishment?')
  }

  punishmentSpecifics = (): PageElement => cy.get('[data-qa="paybackPunishmentSpecifics-radios"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="punishment-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
