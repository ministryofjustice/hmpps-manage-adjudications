import Page, { PageElement } from './page'

export default class CompleteRehabilitativeActivity extends Page {
  constructor() {
    super('Confirm if the activity was completed')
  }

  completedChoice = (): PageElement => cy.get('[data-qa="completed-radios"]')

  submitButton = (): PageElement => cy.get('[data-qa="complete-activity-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="complete-activity-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
