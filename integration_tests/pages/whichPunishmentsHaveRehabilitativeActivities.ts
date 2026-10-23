import Page, { PageElement } from './page'

export default class WhichPunishmentsHaveRehabilitativeActivitiesPage extends Page {
  constructor() {
    super('Which punishments have a rehabilitative activity condition?')
  }

  punishments = (): PageElement => cy.get('[data-qa="rehabilitative-activity-punishments"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
