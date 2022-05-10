import { PageElement } from './page'
import { forceDateInput } from '../componentDrivers/dateInput'

export default class AdjudicationsFilter {
  // This bypasses the date picker and manually forces the date field.
  forceFromDate = (day: number, month: number, year: number): PageElement =>
    forceDateInput(day, month, year, '[data-qa="from-date"]')

  // This bypasses the date picker and manually forces the date field.
  forceToDate = (day: number, month: number, year: number): PageElement =>
    forceDateInput(day, month, year, '[data-qa="to-date"]')

  toDateInput = () => cy.get('[data-qa="to-date"]')

  fromDateInput = () => cy.get('[data-qa="from-date"]')

  selectStatus = () => cy.get('#status')

  applyButton = () => cy.get('[data-qa="filter-apply"]')

  filterBar = () => cy.get('[data-qa="filter-bar"]')
}
