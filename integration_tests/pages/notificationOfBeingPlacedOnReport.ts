import Page, { PageElement } from './page'

export default class PrintReportPage extends Page {
  constructor(title: string) {
    super(title)
  }

  adjudicationNumber = (): PageElement => cy.get('[data-qa=notice-of-being-placed-on-report-adjudication-number]')

  section = (): PageElement => cy.get('[data-qa=notification-of-being-on-report-section')

  prisonerDisplayName = (): PageElement => cy.get('[data-qa=notice-of-being-placed-on-report-prisoner-display-name')

  prisonerNumber = (): PageElement => cy.get('[data-qa=notice-of-being-placed-on-report-prisoner-number')

  prisonerLocationDescription = (): PageElement =>
    cy.get('[data-qa=notice-of-being-placed-on-report-prisoner-location-description')

  incidentDate = (): PageElement => cy.get('[data-qa=notice-of-being-placed-on-report-incident-date')

  incidentTime = (): PageElement => cy.get('[data-qa=notice-of-being-placed-on-report-incident-time')

  incidentLocationDescription = (): PageElement =>
    cy.get('[data-qa=notice-of-being-placed-on-report-incident-location-description')

  statement = (): PageElement => cy.get('[data-qa=notice-of-being-placed-on-report-statement')

  reportingOfficer = (): PageElement => cy.get('[data-qa=notice-of-being-placed-on-report-reporting-officer')
}
