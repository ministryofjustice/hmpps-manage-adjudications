import Page, { PageElement } from './page'

export default class IncompleteRehabilitativeActivity extends Page {
  constructor() {
    super('Select what happens to')
  }

  radios = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  daysToActivate = (): PageElement => cy.get('[data-qa="days-to-activate"]')

  suspendedUntil = (): PageElement => cy.get('[data-qa="date-picker"]')

  submitButton = (): PageElement => cy.get('[data-qa="complete-activity-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="complete-activity-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
