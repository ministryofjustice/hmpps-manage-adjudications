import Page, { PageElement } from './page'

export default class PaybackPunishmentDetailsPage extends Page {
  constructor() {
    super('Enter the details of the punishment')
  }

  details = (): PageElement => cy.get('[data-qa="paybackNotes"]')

  submitButton = (): PageElement => cy.get('[data-qa="payback-punishment-notes-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="payback-punishment-notes-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
