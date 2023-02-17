import Page, { PageElement } from './page'

export default class ProsuectionPage extends Page {
  constructor() {
    super('Will this charge continue to prosecution?')
  }

  prosecutionRadioButtons = (): PageElement => cy.get('[data-qa="radio-buttons-prosecution"]')

  nextStepRadioButtons = (): PageElement => cy.get('[data-qa="radio-buttons-next-step"]')

  submitButton = (): PageElement => cy.get('[data-qa="prosecution-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="prosecution-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
