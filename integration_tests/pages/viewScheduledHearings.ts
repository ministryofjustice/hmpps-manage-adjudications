import { forceDateInput } from '../componentDrivers/dateInput'
import Page, { PageElement } from './page'

export default class ViewScheduledHearingsPage extends Page {
  constructor() {
    super('Adjudications')
  }

  scheduledHearingsTab = (): PageElement => cy.get('[data-qa="viewScheduledHearingsTab"]')

  allReportsTab = (): PageElement => cy.get('[data-qa="viewAllCompletedReportsTab"]')

  leftArrow = (): PageElement => cy.get('[data-qa="hearing-date-left-arrow"]')

  rightArrow = (): PageElement => cy.get('[data-qa="hearing-date-right-arrow"]')

  datePicker = (): PageElement => cy.get('[data-qa="hearing-date-picker"]')

  // This bypasses the date picker and manually forces the date field.
  forceHearingDate = (day: number, month: number, year: number): PageElement =>
    forceDateInput(day, month, year, '[data-qa="hearing-date-picker"]')

  applyButton = (): PageElement => cy.get('[data-qa="hearings-filter-apply"]')

  clearLink = (): PageElement => cy.get('[data-qa="clear-filter"]')

  viewReportLink = (hearingNumber: number): PageElement => cy.get(`[data-qa="view-report-link-${hearingNumber}"]`)

  viewOrEditHearingLink = (hearingNumber: number): PageElement =>
    cy.get(`[data-qa="view-edit-hearing-link-${hearingNumber}"]`)

  hearingTable = (): PageElement => cy.get('[data-qa="scheduled-hearings-results-table"]')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
