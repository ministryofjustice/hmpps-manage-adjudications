import Page, { PageElement } from './page'

export default class PrisonerReportPage extends Page {
  constructor() {
    super('report')
  }

  incidentDetailsSummary = (): PageElement => cy.get('[data-qa="details-summary-table"]')

  incidentStatement = (): PageElement => cy.get('[data-qa="adjudicationsSummary-incidentStatement"]')

  incidentDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-details-changeLink"]')

  incidentStatementChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-statement-changeLink"]')

  returnLink = (): PageElement => cy.get('[data-qa="prisoner-report-return-link"]')
}
