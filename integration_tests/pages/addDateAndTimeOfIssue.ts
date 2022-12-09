import Page, { PageElement } from './page'

export default class AddDateAndTimeOfIssuePage extends Page {
  constructor() {
    super('Add date and time')
  }

  hintText = (): PageElement => cy.get('[data-qa="hint-para"]')

  dateInput = (): PageElement => cy.get('[data-qa="issued-date"]')

  hourInput = (): PageElement => cy.get('[data-qa="issued-hour"]')

  minutesInput = (): PageElement => cy.get('[data-qa="issued-minutes"]')

  submitButton = (): PageElement => cy.get('[data-qa="issue-date-and-time-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="issue-date-and-time-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
