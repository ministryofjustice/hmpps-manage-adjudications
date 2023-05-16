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

  nextStepRadioLegend = (): PageElement => cy.get('.govuk-fieldset__legend')

  nextStepRadios = (): PageElement => cy.get('[data-qa="next-step-radios"]')

  nextStepConfirmationButton = (): PageElement => cy.get('[data-qa="next-step-continue"]')

  // Scheduled state

  hearingIndex = (index: number): PageElement => cy.get(`[data-qa="hearing-index-${index}"]`)

  hearingSummaryTable = (index: number): PageElement => cy.get(`[data-qa="details-summary-table-${index}"]`)

  enterHearingOutcomeButton = (): PageElement => cy.get('[data-qa="enter-hearing-outcome-button"]')

  removeHearingButton = (): PageElement => cy.get('[data-qa="remove-hearing-button"')

  changeLink = (): PageElement => cy.get('[data-qa="change-link"')

  // Adjourned state

  scheduleAnotherHearingButton = (): PageElement => cy.get('[data-qa="schedule-another-hearing-button"]')

  removeAdjournedHearingButton = (): PageElement => cy.get('[data-qa="remove-adjourn-hearing-button"')

  // Referred state

  removeReferralButton = (): PageElement => cy.get('[data-qa="remove-referral-button"]')

  enterReferralOutcomeButton = (): PageElement => cy.get('[data-qa="enter-referral-outcome-button"]')

  policeReferralTable = (): PageElement => cy.get('[data-qa="police-referral-table"]')

  nextStepReferralOutcomeButton = (): PageElement => cy.get('[data-qa="continue-to-next-step-button"]')

  inAdReferralTable = (): PageElement => cy.get('[data-qa="inad-referral-table"]')

  referralChangeLink = (): PageElement => cy.get('[data-qa="change-link-hearing-outcome-reason-for-referral"]')

  // Not proceed state

  notProceedTable = (): PageElement => cy.get('[data-qa="not-proceed-summary-table"]')

  removeOutcomeButton = (): PageElement => cy.get('[data-qa="remove-outcome-button"]')

  changeOutcomeReason = (): PageElement => cy.get('[data-qa="change-link-outcome-reason"]')

  // Quashed

  quashedTable = (): PageElement => cy.get('[data-qa="quashed-table"]')

  removeQuashedOutcomeButton = (): PageElement => cy.get('[data-qa="remove-quashed-finding-button"]')

  changeQuashReasonLink = (): PageElement => cy.get('[data-qa="change-link-quash-guilty-finding"]')

  // General

  ReturnToAllHearingsLink = (): PageElement => cy.get('[data-qa="all-hearings-link"]')

  viewAllCompletedReportsLink = (): PageElement => cy.get('[data-qa="all-completed-reports-link"]')

  reviewStatus = (): PageElement => cy.get('[data-qa="review-status"]')

  hearingTabName = (): PageElement => cy.get('[data-qa="hearingsTab"]')

  outcomeTableTitle = (): PageElement => cy.get('[data-qa="outcome-table-title"]')

  removeCompleteHearingOutcomeButton = (): PageElement => cy.get('[data-qa="remove-complete-hearing-outcome-button"')

  reportQuashedGuiltyFindingButton = (): PageElement => cy.get('[data-qa="report-quashed-finding"')
}
