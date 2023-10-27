export default class DISFormsFilter {
  toDateInput = () => cy.get('[data-qa="toDate"]')

  fromDateInput = () => cy.get('[data-qa="fromDate"]')

  selectLocation = () => cy.get('#locationId')

  applyButton = () => cy.get('[data-qa="filter-apply"]')

  filterBar = () => cy.get('[data-qa="filter-bar"]')
}
