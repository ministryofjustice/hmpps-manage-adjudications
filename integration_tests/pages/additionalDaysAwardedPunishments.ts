import Page, { PageElement } from './page'
import { forceDateInput } from '../componentDrivers/dateInput'

export default class Home extends Page {
  constructor() {
    super('Awarded punishments and damages')
  }

  allAwardedPunishmentsAndDamagesTab = (): PageElement => cy.get('[data-qa="allAwardedPunishmentsAndDamagesTab"]')

  financialAwardedPunishmentsAndDamagesTab = (): PageElement =>
    cy.get('[data-qa="financialAwardedPunishmentsAndDamagesTab"]')

  additionalDaysAwardedPunishmentsTab = (): PageElement => cy.get('[data-qa="additionalDaysAwardedPunishmentsTab"]')

  leftArrow = (): PageElement => cy.get('[data-qa="hearing-date-left-arrow"]')

  rightArrow = (): PageElement => cy.get('[data-qa="hearing-date-right-arrow"]')

  datePicker = (): PageElement => cy.get('[data-qa="hearing-date-picker"]')

  // This bypasses the date picker and manually forces the date field.
  forceHearingDate = (day: number, month: number, year: number): PageElement =>
    forceDateInput(day, month, year, '[data-qa="hearing-date-picker"]')

  selectLocation = () => cy.get('#locationId')

  applyButton = (): PageElement => cy.get('[data-qa="awarded-punishments-and-damages-filter-apply"]')

  clearLink = (): PageElement => cy.get('[data-qa="clear-filter"]')

  viewPunishmentsLink = (resultNumber: number): PageElement =>
    cy.get(`[data-qa="view-punishments-link-${resultNumber}"]`)

  resultsTable = (): PageElement => cy.get('[data-qa="awarded-punishments-and-damages-results-table"]')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
