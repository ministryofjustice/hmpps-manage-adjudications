import Page, { PageElement } from './page'

export default class Home extends Page {
  constructor() {
    super('View hearing outcomes')
  }

  allAwardedPunishmentsAndDamagesTab = (): PageElement => cy.get('[data-qa="allAwardedPunishmentsAndDamagesTab"]')

  financialAwardedPunishmentsAndDamagesTab = (): PageElement =>
    cy.get('[data-qa="financialAwardedPunishmentsAndDamagesTab"]')

  additionalDaysAwardedPunishmentsTab = (): PageElement => cy.get('[data-qa="additionalDaysAwardedPunishmentsTab"]')

  financialGuidanceMessage = (): PageElement => cy.get('[data-qa="financial-guidance"]')

  datePicker = (): PageElement => cy.get('[data-qa="date-picker"]')

  selectLocation = () => cy.get('#locationId')

  applyButton = (): PageElement => cy.get('[data-qa="awarded-punishments-and-damages-filter-apply"]')

  clearLink = (): PageElement => cy.get('[data-qa="clear-filter"]')

  actionLink = (resultNumber: number): PageElement => cy.get(`[data-qa="action-link-${resultNumber}"]`)

  resultsTable = (): PageElement => cy.get('[data-qa="awarded-punishments-and-damages-results-table"]')

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
