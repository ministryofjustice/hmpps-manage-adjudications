import Page, { PageElement } from './page'

export default class PaybackPunishmentDurationPage extends Page {
  constructor() {
    super('Enter how many hours this punishment will last')
  }

  punishment = (): PageElement => cy.get('[data-qa="duration-input"]')

  submitButton = (): PageElement => cy.get('[data-qa="payback-punishment-duration-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="payback-punishment-duration-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
