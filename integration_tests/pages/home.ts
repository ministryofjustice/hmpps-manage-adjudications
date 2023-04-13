import Page, { PageElement } from './page'

export default class Home extends Page {
  constructor() {
    super('Adjudications')
  }

  signInName = (): PageElement => cy.get('[data-qa="sign-in-name"]')

  activeLocation = (): PageElement => cy.get('[data-qa="active-location"]')

  sectionBreak = (): PageElement => cy.get('[data-qa="section-break"]')

  viewScheduledHearingsCard = (): PageElement => cy.get('a').contains('View all hearings')

  startANewReportLink = (): PageElement => cy.get('a').contains('Start a new report')

  continueAReportLink = (): PageElement => cy.get('a').contains('Continue a report')

  viewYourCompletedReportsLink = (): PageElement => cy.get('a').contains('View your completed reports')

  viewAllReportsCard = (): PageElement => cy.get('a').contains('View all reports')

  reviewReportsLink = (): PageElement => cy.get('[data-qa="review-reports"]')

  scheduleHearingsLink = (): PageElement => cy.get('[data-qa="schedule-hearings"]')

  printCompletedDisFormsLink = (): PageElement => cy.get('[data-qa="print-completed-dis-forms"]')

  confirmDisHasBeenIssuedLink = (): PageElement => cy.get('[data-qa="confirm-dis-has-been-issued"]')

  enterOutcomesCard = (): PageElement => cy.get('a').contains('Enter outcomes')
}
