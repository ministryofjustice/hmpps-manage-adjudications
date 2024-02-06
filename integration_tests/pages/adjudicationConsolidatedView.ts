import Page, { PageElement } from './page'

export default class AdjudicationConsolidatedViewPage extends Page {
  constructor() {
    super('Adjudication for charge')
  }

  reviewSummaryTitle = (): PageElement => cy.get('[data-qa="review-status"]')

  reviewSummary = (): PageElement => cy.get('[data-qa="review-summary"]')

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

  transferBannerHeader = (): PageElement => cy.get('[data-qa="transferBanner-header"]')

  transferBannerParagraph = (): PageElement => cy.get('[data-qa="transferBanner-outcomePara"]')

  noHearingsText = (): PageElement => cy.get('[data-qa="no-scheduled-hearings"]')

  noPunishmentsText = (): PageElement => cy.get('[data-qa="no-punishments"]')

  hearingSummaryTable = (index: number): PageElement => cy.get(`[data-qa="details-summary-table-${index}"]`)

  hearingIndex = (index: number): PageElement => cy.get(`[data-qa="hearing-index-${index}"]`)

  policeReferralTable = (): PageElement => cy.get('[data-qa="police-referral-table"]')

  awardPunishmentsTable = (): PageElement => cy.get('[data-qa="punishments-table"]')

  damagesMoneyTable = (): PageElement => cy.get('[data-qa="damages-money-table"]')

  punishmentCommentsTable = (): PageElement => cy.get('[data-qa="punishment-comments-table"]')

  quashedTable = (): PageElement => cy.get('[data-qa="quashed-table"]')

  quashedWarning = (): PageElement => cy.get('[data-qa="quashed-warning"]')
}
