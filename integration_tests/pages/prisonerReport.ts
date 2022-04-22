import Page, { PageElement } from './page'

export default class PrisonerReportPage extends Page {
  constructor() {
    super('report')
  }

  reportNumber = (): PageElement => cy.get('[data-qa="reportNumber"]')

  incidentDetailsSummary = (): PageElement => cy.get('[data-qa="details-summary-table"]')

  offenceDetailsSummary = (): PageElement => cy.get('[data-qa="offence-summary-table"]')

  incidentStatement = (): PageElement => cy.get('[data-qa="adjudicationsSummary-incidentStatement"]')

  incidentDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-details-changeLink"]')

  incidentStatementChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-statement-changeLink"]')

  offenceDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-offence-changeLink"]')

  reviewerPanel = (): PageElement => cy.get('[data-qa="adjudication-review-panel"]')

  reviewStatus = (): PageElement => cy.get('[data-qa="review-radio-buttons"]')

  reviewRejectReason = (): PageElement => cy.get('select[name="rejectedReasonId"]')

  reviewRejectDetail = (): PageElement => cy.get('[data-qa="rejected-details-input"]')

  reviewReportReason = (): PageElement => cy.get('select[name="returnedReasonId"]')

  reviewReportDetail = (): PageElement => cy.get('[data-qa="returned-details-input"]')

  reviewExit = (): PageElement => cy.get('[data-qa="review-exit"]')

  reviewSubmit = (): PageElement => cy.get('[data-qa="review-submit"]')

  returnLink = (): PageElement => cy.get('[data-qa="prisoner-report-return-link"]')
}
