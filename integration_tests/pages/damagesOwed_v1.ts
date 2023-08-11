import Page, { PageElement } from './page'

export default class DamagesOwedPage extends Page {
  constructor() {
    super('Is any money being recovered for damages?')
  }

  damagesOwedRadioButtons = (): PageElement => cy.get('[data-qa="radio-buttons-damages-owed"]')

  amount = (): PageElement => cy.get('input[id="amount"]')

  submitButton = (): PageElement => cy.get('[data-qa="damages-owed-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="damages-owed-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
