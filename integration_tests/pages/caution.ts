import Page, { PageElement } from './page'

export default class CautionPage extends Page {
  constructor() {
    super('Is the punishment a caution?')
  }

  cautionRadioButtons = (): PageElement => cy.get('[data-qa="radio-buttons-caution"]')

  submitButton = (): PageElement => cy.get('[data-qa="caution-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="caution-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
