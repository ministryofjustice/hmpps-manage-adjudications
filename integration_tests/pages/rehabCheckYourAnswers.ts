import Page, { PageElement } from './page'

export default class RehabCheckYourAnswerssPage extends Page {
  constructor() {
    super('Check your answers')
  }

  completedChangeLink = (): PageElement => cy.get('[data-qa="completed-change-link"')

  outcomeChangeLink = (): PageElement => cy.get('[data-qa="outcome-change-link"')

  submitButton = (): PageElement => cy.get('[data-qa="confirm-complete-activity-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="confirm-complete-activity-cancel"]')
}
