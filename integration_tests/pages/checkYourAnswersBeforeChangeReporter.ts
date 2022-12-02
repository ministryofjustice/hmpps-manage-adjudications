import Page, { PageElement } from './page'

export default class CheckYourAnswersPage extends Page {
  constructor() {
    super('Check your answers before changing the report')
  }

  genderDetailsSummary = (): PageElement => cy.get('[data-qa="gender-summary-table"]')

  reviewStatus = (): PageElement => cy.get('[data-qa="review-status"]')

  reviewSummary = (): PageElement => cy.get('[data-qa="review-summary"]')

  incidentDetailsSummary = (): PageElement => cy.get('[data-qa="details-summary-table"]')

  incidentStatement = (): PageElement => cy.get('[data-qa="adjudicationsSummary-incidentStatement"]')

  offenceDetailsSummary = (): PageElement => cy.get('[data-qa="offence-summary-table"]')

  incidentDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-details-changeLink"]')

  incidentStatementChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-statement-changeLink"]')

  offenceDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-offence-changeLink"]')

  submitButton = (): PageElement => cy.get('[data-qa="check-answers-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="check-answers-exit"]')
}
