import Page, { PageElement } from './page'

export default class ViewScheduledHearingsPage extends Page {
  constructor() {
    super('Hearings')
  }

  datePicker = (): PageElement => cy.get('[data-qa="date-picker"]')

  applyButton = (): PageElement => cy.get('[data-qa="hearings-filter-apply"]')

  clearLink = (): PageElement => cy.get('[data-qa="clear-filter"]')

  viewReportLink = (hearingNumber: number): PageElement => cy.get(`[data-qa="view-report-link-${hearingNumber}"]`)

  viewOrEditHearingLink = (hearingNumber: number): PageElement =>
    cy.get(`[data-qa="view-edit-hearing-link-${hearingNumber}"]`)

  hearingTable = (): PageElement => cy.get('[data-qa="scheduled-hearings-results-table"]')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
