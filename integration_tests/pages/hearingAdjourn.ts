import Page, { PageElement } from './page'

export default class HearingAdjourn extends Page {
  constructor() {
    super('Adjourn the hearing for another reason')
  }

  adjournReason = (): PageElement => cy.get('#adjournReason')

  adjournDetails = (): PageElement => cy.get('[data-qa="adjourn-details"]')

  adjournPlea = (): PageElement => cy.get('[data-qa="adjourn-plea-radio-buttons"]')

  submitButton = (): PageElement => cy.get('[data-qa="adjourn-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  cancelButton = (): PageElement => cy.get('[data-qa="adjourn-cancel"]')
}
