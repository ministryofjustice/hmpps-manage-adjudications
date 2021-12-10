import Page, { PageElement } from './page'

export default class CheckYourAnswersPage extends Page {
  constructor() {
    super('Check your answers')
  }

  incidentDetailsSummary = (): PageElement => cy.get('[data-qa="details-summary-table"]')

  incidentStatement = (): PageElement => cy.get('[data-qa="adjudicationsSummary-incidentStatement"]')

  incidentDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-details-changeLink"]')

  incidentStatementChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-statement-changeLink"]')

  submitButton = (): PageElement => cy.get('[data-qa="check-answers-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="check-answers-exit"]')
}
