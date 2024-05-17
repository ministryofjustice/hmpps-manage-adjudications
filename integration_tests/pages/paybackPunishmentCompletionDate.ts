import Page, { PageElement } from './page'

export default class PaybackPunishmentCompletionDatePage extends Page {
  constructor() {
    super('When does this punishment need to be completed by?')
  }

  dateInput = (): PageElement => cy.get('[data-qa="endDate"]')

  submitButton = (): PageElement => cy.get('[data-qa="payback-punishment-completion-date-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="payback-punishment-completion-date-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
