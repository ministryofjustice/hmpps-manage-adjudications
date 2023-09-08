import Page, { PageElement } from './page'

export default class PunishmentSuspendedUntilPage extends Page {
  constructor() {
    super('Enter the date the punishment is suspended until')
  }

  suspendedUntil = (): PageElement => cy.get('[data-qa="suspended-until-date-picker"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-suspended-until-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="punishment-suspended-until-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
