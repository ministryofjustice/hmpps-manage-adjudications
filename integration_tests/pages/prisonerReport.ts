import Page, { PageElement } from './page'

export default class PrisonerReportPage extends Page {
  constructor() {
    super('report')
  }

  incidentDetailsSummary = (): PageElement => cy.get('[data-qa="prisoner-report-details"]')

  incidentStatement = (): PageElement => cy.get('[data-qa="prisoner-report-statement"]')

  incidentDetailsChangeLink = (): PageElement => cy.get('[data-qa="prisoner-report-details-changeLink"]')

  incidentStatementChangeLink = (): PageElement => cy.get('[data-qa="prisoner-report-statement-changeLink"]')

  returnLink = (): PageElement => cy.get('[data-qa="prisoner-report-return-link"]')
}
