export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').should('contain', this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa="signOut"]')

  feedbackBanner = (): PageElement => cy.get('[data-qa="feedback-banner"]')
}
