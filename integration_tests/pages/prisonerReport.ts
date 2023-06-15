import Page, { PageElement } from './page'

export default class PrisonerReportPage extends Page {
  constructor() {
    super('report')
  }

  reviewSummaryTitle = (): PageElement => cy.get('[data-qa="review-status"]')

  reviewSummary = (): PageElement => cy.get('[data-qa="review-summary"]')

  reportNumber = (): PageElement => cy.get('[data-qa="reportNumber"]')

  incidentDetailsSummary = (): PageElement => cy.get('[data-qa="details-summary-table"]')

  offenceDetailsSummary = (): PageElement => cy.get('[data-qa="offence-summary-table"]')

  damageSummary = (): PageElement => cy.get('[data-qa="damages-table"]')

  damagesAbsentText = (): PageElement => cy.get('[data-qa="adjudicationsSummary-damages-none"]')

  photoVideoEvidenceSummary = (): PageElement => cy.get('[data-qa="photoVideoTable-evidence-table"]')

  baggedAndTaggedEvidenceSummary = (): PageElement => cy.get('[data-qa="baggedAndTaggedTable-evidence-table"]')

  evidenceAbsentText = (): PageElement => cy.get('[data-qa="adjudicationsSummary-evidence-none"]')

  witnessesSummary = (): PageElement => cy.get('[data-qa="witnesses-table"]')

  witnessesAbsentText = (): PageElement => cy.get('[data-qa="adjudicationsSummary-witnesses-none"]')

  incidentStatement = (): PageElement => cy.get('[data-qa="adjudicationsSummary-incidentStatement"]')

  incidentDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-details-changeLink"]')

  incidentStatementChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-statement-changeLink"]')

  offenceDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-offence-changeLink"]')

  damagesChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-damages-changeLink"]')

  evidenceChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-evidence-changeLink"]')

  witnessesChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-witnesses-changeLink"]')

  reviewerPanel = (): PageElement => cy.get('[data-qa="adjudication-review-panel"]')

  reviewStatus = (): PageElement => cy.get('[data-qa="review-radio-buttons"]')

  reviewRejectReason = (): PageElement => cy.get('select[name="rejectedReasonId"]')

  reviewRejectDetail = (): PageElement => cy.get('[data-qa="rejected-details-input"]')

  acceptedRejectDetail = (): PageElement => cy.get('[data-qa="accepted-details-input"]')

  reviewReportReason = (): PageElement => cy.get('select[name="returnedReasonId"]')

  reviewReportDetail = (): PageElement => cy.get('[data-qa="returned-details-input"]')

  reviewExit = (): PageElement => cy.get('[data-qa="review-exit"]')

  reviewSubmit = (): PageElement => cy.get('[data-qa="review-submit"]')

  returnLink = (): PageElement => cy.get('[data-qa="prisoner-report-return-link"]')

  hearingsTab = (): PageElement => cy.get('[data-qa="hearingsTab"]')

  punishmentsTab = (): PageElement => cy.get('[data-qa="punishmentsTab"]')
}
