export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=sign-out]')

  feedbackBanner = (): PageElement => cy.get('[data-qa="feedback-banner"]')

  startANewReportLink = (): PageElement => cy.get('a').contains('Start a new report')

  continueAReportLink = (): PageElement => cy.get('a').contains('Continue a report')

  viewYourCompletedReportsLink = (): PageElement => cy.get('a').contains('View your completed reports')

  viewAllCompletedReportsLink = (): PageElement => cy.get('a').contains('View all completed reports')
}
