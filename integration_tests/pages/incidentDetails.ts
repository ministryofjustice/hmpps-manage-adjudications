import Page, { PageElement } from './page'

export default class IncidentDetailsPage extends Page {
  constructor() {
    super('Incident details')
  }

  reportingOfficerLabel = (): PageElement => cy.get('[data-qa="reportingOfficer-label"]')

  reportingOfficerName = (): PageElement => cy.get('[data-qa="reportingOfficer-name"]')

  datePicker = (): PageElement => cy.get('[data-qa="incident-details-date"]')

  timeInputHours = (): PageElement => cy.get('[data-qa="incident-date-hour"]')

  timeInputMinutes = (): PageElement => cy.get('[data-qa="incident-date-minutes"]')

  locationSelector = (): PageElement => cy.get('#locationId')

  submitButton = (): PageElement => cy.get('[data-qa="incident-details-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
