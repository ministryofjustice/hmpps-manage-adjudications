import Page, { PageElement } from './page'

export default class HearingDetailsPage extends Page {
  constructor() {
    super('Adjudication for report')
  }

  reviewStatus = (): PageElement => cy.get('[data-qa="review-status"]')

  schedulingUnavailableP1 = (): PageElement => cy.get('[data-qa="scheduling-unavailable-1"]')

  schedulingUnavailableP2 = (): PageElement => cy.get('[data-qa="scheduling-unavailable-2"]')

  hearingIndex = (index: number): PageElement => cy.get(`[data-qa="hearing-index-${index}"]`)

  summaryTable = (): PageElement => cy.get('[data-qa="details-summary-table"]')

  noHearingsScheduled = (): PageElement => cy.get('[data-qa="no-hearings-scheduled"]')

  scheduleHearingButton = (): PageElement => cy.get('[data-qa="scheduleHearingButton"]')

  viewAllCompletedReportsLink = (): PageElement => cy.get('[data-qa="all-completed-reports-link"]')

  viewYourCompletedReportsLink = (): PageElement => cy.get('[data-qa="your-completed-reports-link"]')

  cancelHearingButton = (hearingIndex: number): PageElement => cy.get(`[data-qa="cancelHearingButton-${hearingIndex}"`)

  changeLink = (): PageElement => cy.get('[data-qa="change-link"')
}
