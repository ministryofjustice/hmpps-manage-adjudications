import Page, { PageElement } from './page'

export default class DamagesAmountPage extends Page {
  constructor() {
    super('Enter the amount to be recovered for damages')
  }

  damagesAmount = (): PageElement => cy.get('input[id="damagesOwedAmount"]')

  submitButton = (): PageElement => cy.get('[data-qa="damages-owed-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="damages-owed-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
