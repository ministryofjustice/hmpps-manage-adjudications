import Page, { PageElement } from './page'

export default class YourCompletedReportsPage extends Page {
  constructor() {
    super('Your completed reports')
  }

  noResultsMessage = (): PageElement => cy.get('[data-qa="no-results-message"]')
}
