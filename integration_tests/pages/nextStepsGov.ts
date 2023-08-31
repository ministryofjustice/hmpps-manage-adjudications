import Page, { PageElement } from './page'

export default class NextStepsGovPage extends Page {
  constructor() {
    super('What is the next step?')
  }

  nextStepRadioButtons = (): PageElement => cy.get('[data-qa="radio-buttons-next-step"]')

  submitButton = (): PageElement => cy.get('[data-qa="nextstep-gov-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="nextstep-gov-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
