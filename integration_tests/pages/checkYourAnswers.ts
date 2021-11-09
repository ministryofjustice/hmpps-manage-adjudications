import Page, { PageElement } from './page'

export default class CheckYourAnswersPage extends Page {
  constructor() {
    super('Check your answers')
  }

  incidentDetailsSummary = (): PageElement => cy.get('[data-qa="check-answers-details"]')

  incidentStatement = (): PageElement => cy.get('[data-qa="check-answers-statement"]')

  incidentDetailsChangeLink = (): PageElement => cy.get('[data-qa="check-answers-details-changeLink"]')

  incidentStatementChangeLink = (): PageElement => cy.get('[data-qa="check-answers-statement-changeLink"]')

  submitButton = (): PageElement => cy.get('[data-qa="check-answers-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="check-answers-exit"]')
}
