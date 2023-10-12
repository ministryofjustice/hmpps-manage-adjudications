import Page, { PageElement } from './page'

export default class ManuallyActivateSuspendedPunishmentPage extends Page {
  constructor() {
    super('Manually activate an existing suspended punishment')
  }

  chargeNumberForSuspendedPunishment = (): PageElement => cy.get('[data-qa="chargeNumberForSuspendedPunishment"]')

  punishment = (): PageElement => cy.get('[data-qa="punishment-radio-buttons"]')

  privilege = (): PageElement => cy.get('[data-qa="privilege-radio-buttons"]')

  stoppagePercentage = (): PageElement => cy.get('[data-qa="stoppage-percentage"]')

  otherPrivilege = (): PageElement => cy.get('[data-qa="other-privilege"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
