import Page, { PageElement } from './page'

export default class IsThereRehabilitativeActivitesPage extends Page {
  constructor() {
    super('Is there a rehabilitative activity condition?')
  }

  rehabChoice = (): PageElement => cy.get('[data-qa="isThereRehabilitativeActivities-radios"]')

  numberOfActivities = (): PageElement => cy.get('[data-qa="number-of-activities"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="punishment-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
