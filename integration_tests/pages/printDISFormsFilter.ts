export default class PrintDISFormsFilter {
  toDateInput = () => cy.get('[data-qa="toDate"]')

  fromDateInput = () => cy.get('[data-qa="fromDate"]')

  selectLocation = () => cy.get('#locationId')

  issuedCheckbox = () => cy.get('#issueStatus')

  notIssuedCheckbox = () => cy.get('#issueStatus-2')

  applyButton = () => cy.get('[data-qa="filter-apply"]')

  filterBar = () => cy.get('[data-qa="filter-bar"]')
}
