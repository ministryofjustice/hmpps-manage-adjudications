import Page, { PageElement } from './page'

export default class CheckYourAnswersPage extends Page {
  constructor() {
    super('Check your answers before placing them on report')
  }

  genderDetailsSummary = (): PageElement => cy.get('[data-qa="gender-summary-table"]')

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

  offenceDetailsChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-offence-changeLink"]')

  damagesChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-damages-changeLink"]')

  evidenceChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-evidence-changeLink"]')

  witnessesChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-witnesses-changeLink"]')

  incidentStatementChangeLink = (): PageElement => cy.get('[data-qa="adjudicationsSummary-statement-changeLink"]')

  submitButton = (): PageElement => cy.get('[data-qa="check-answers-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="check-answers-exit"]')
}
