import Page, { PageElement } from './page'

export default class AcceptedReportConfirmationPage extends Page {
  constructor() {
    super('report has been accepted')
  }

  banner = (): PageElement => cy.get('[data-qa="accepted-report-confirmation-banner"]')

  p1 = (): PageElement => cy.get('[data-qa="para-1"]')

  p2 = (): PageElement => cy.get('[data-qa="para-2"]')

  p3 = (): PageElement => cy.get('[data-qa="para-3"]')

  tp1 = (): PageElement => cy.get('[data-qa="transfer-para-1"]')

  tp2 = (): PageElement => cy.get('[data-qa="transfer-para-2"]')

  tp3 = (): PageElement => cy.get('[data-qa="transfer-para-3"]')

  tp4 = (): PageElement => cy.get('[data-qa="transfer-para-4"]')

  scheduleHearingButton = (): PageElement => cy.get('[data-qa="schedule-hearing-button"]')

  viewReportLink = (): PageElement => cy.get('[data-qa="view-report-link"]')

  allCompletedReportsLink = (): PageElement => cy.get('[data-qa="all-completed-reports-link"]')

  inTextReportsLink = (): PageElement => cy.get('[data-qa="para-reports-link"]')
}
