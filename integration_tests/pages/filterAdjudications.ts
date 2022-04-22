import { PageElement } from './page'

export default class FilterAdjudications {
  // In order to bypass the date picker we force the input to accept text and then press escape so the date picker
  // disappears allowing us to interact with other fields.
  private forceDateInput = (dateInput: PageElement, day: number, month: number, year: number): PageElement =>
    dateInput
      .clear({ force: true })
      .type(`${`0${day}`.slice(-2)}/${`0${month}`.slice(-2)}/${year}{esc}`, { force: true })

  // This bypasses the date picker and manually forces the date field.
  forceFromDate = (day: number, month: number, year: number): PageElement =>
    this.forceDateInput(cy.get('[data-qa="from-date"]'), day, month, year)

  // This bypasses the date picker and manually forces the date field.
  forceToDate = (day: number, month: number, year: number): PageElement =>
    this.forceDateInput(cy.get('[data-qa="to-date"]'), day, month, year)

  selectStatus = () => cy.get('#status')

  applyButton = () => cy.get('[data-qa="filter-apply"]')
}
