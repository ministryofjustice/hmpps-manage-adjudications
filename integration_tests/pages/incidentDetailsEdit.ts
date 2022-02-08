import Page, { PageElement } from './page'

export default class IncidentDetailsEditPage extends Page {
  constructor() {
    super('Incident details')
  }

  reportingOfficerLabel = (): PageElement => cy.get('[data-qa="reportingOfficer-label"]')

  reportingOfficerName = (): PageElement => cy.get('[data-qa="reportingOfficer-name"]')

  datePicker = (): PageElement => cy.get('[data-qa="incident-details-date"]')

  timeInputHours = (): PageElement => cy.get('[data-qa="incident-date-hour"]')

  timeInputMinutes = (): PageElement => cy.get('[data-qa="incident-date-minutes"]')

  locationSelector = (): PageElement => cy.get('#locationId')

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  radioButtonLegend = (): PageElement => cy.get('legend')

  conditionalInputIncite = (): PageElement => cy.get('#inciteAnotherPrisonerInput')

  conditionalInputAssist = (): PageElement => cy.get('#assistAnotherPrisonerInput')

  searchButtonIncite = (): PageElement => cy.get('[data-qa="incite-prisoner-search"]')

  searchButtonAssist = (): PageElement => cy.get('[data-qa="assist-prisoner-search"]')

  submitButton = (): PageElement => cy.get('[data-qa="incident-details-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="incident-details-exit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
