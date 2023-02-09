import Page, { PageElement } from './page'

export default class HearingTabPage extends Page {
  constructor() {
    super('Adjudication for report')
  }

  // Empty state
  schedulingUnavailableP1 = (): PageElement => cy.get('[data-qa="scheduling-unavailable-1"]')

  schedulingUnavailableP2 = (): PageElement => cy.get('[data-qa="scheduling-unavailable-2"]')

  reportAcceptedNoHearingsScheduled = (): PageElement => cy.get('[data-qa="no-hearings-scheduled"]')

  // Unscheduled state

  noHearingsScheduled = (): PageElement => cy.get('[data-qa="no-scheduled-hearings"]')

  nextStepRadios = (): PageElement => cy.get('[data-qa="next-step-radios"]')

  nextStepConfirmationButton = (): PageElement => cy.get('[data-qa="next-step-continue"]')

  // Scheduled state

  hearingIndex = (index: number): PageElement => cy.get(`[data-qa="hearing-index-${index}"]`)

  summaryTable = (): PageElement => cy.get('[data-qa="details-summary-table"]')

  enterHearingOutcomeButton = (): PageElement => cy.get('[data-qa="enter-hearing-outcome-submit"]')

  cancelHearingButton = (hearingId: number): PageElement => cy.get(`[data-qa="cancel-hearing-button-${hearingId}"`)

  changeLink = (): PageElement => cy.get('[data-qa="change-link"')

  // All

  ReturnToAllHearingsLink = (): PageElement => cy.get('[data-qa="all-hearings-link"]')

  viewAllCompletedReportsLink = (): PageElement => cy.get('[data-qa="all-completed-reports-link"]')

  reviewStatus = (): PageElement => cy.get('[data-qa="review-status"]')
}
