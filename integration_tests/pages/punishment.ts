import Page, { PageElement } from './page'

export default class PunishmentPage extends Page {
  constructor() {
    super('Add a')
  }

  punishment = (): PageElement => cy.get('[data-qa="punishment-radio-buttons"]')

  privilege = (): PageElement => cy.get('[data-qa="privilege-radio-buttons"]')

  stoppagePercentage = (): PageElement => cy.get('[data-qa="stoppage-percentage"]')

  otherPrivilege = (): PageElement => cy.get('[data-qa="other-privilege"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="punishment-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
