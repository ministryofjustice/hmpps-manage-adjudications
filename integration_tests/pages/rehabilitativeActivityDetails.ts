import Page, { PageElement } from './page'

export default class RehabilitativeActivityDetailsPage extends Page {
  constructor() {
    super('Add details of the')
  }

  fullTitle = (): PageElement => cy.get('h1')

  activityDescription = (): PageElement => cy.get('[data-qa="details"]')

  monitorName = (): PageElement => cy.get('[data-qa="monitorName"]')

  endDate = (): PageElement => cy.get('[data-qa="endDate"]')

  numberOfSessions = (): PageElement => cy.get('[data-qa="totalSessions"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancel = (): PageElement => cy.get('[data-qa="punishment-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
