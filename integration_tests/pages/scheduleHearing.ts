import Page, { PageElement } from './page'

export default class ScheduleHearingPage extends Page {
  constructor() {
    super('Schedule a hearing')
  }

  hearingTypeRadios = (): PageElement => cy.get('[data-qa="hearing-type-radio-buttons"]')

  datePicker = (): PageElement => cy.get('[data-qa="hearing-date"]')

  timeInputHours = (): PageElement => cy.get('[data-qa="hearingDate[time][hour]"]')

  timeInputMinutes = (): PageElement => cy.get('[data-qa="hearingDate[time][minute]"]')

  locationSelector = (): PageElement => cy.get('#locationId')

  locationSelectorSelectedOption = (): PageElement => cy.get('#locationId option:selected')

  submitButton = (): PageElement => cy.get('[data-qa="schedule-hearing-submit"]')

  cancelLink = (): PageElement => cy.get('[data-qa="schedule-hearing-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
