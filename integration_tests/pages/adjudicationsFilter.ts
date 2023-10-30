export default class AdjudicationsFilter {
  toDateInput = () => cy.get('[data-qa="toDate"]')

  fromDateInput = () => cy.get('[data-qa="fromDate"]')

  selectStatus = () => cy.get('#status')

  applyButton = () => cy.get('[data-qa="filter-apply"]')

  filterBar = () => cy.get('[data-qa="filter-bar"]')

  uncheckAllCheckboxes = () => cy.get('[type="checkbox"]').uncheck()

  checkCheckboxWithValue = value => cy.get('[type="checkbox"]').check(value)
}
