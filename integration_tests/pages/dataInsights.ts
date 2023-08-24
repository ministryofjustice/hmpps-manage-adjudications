import Page from './page'

export default class DataInsightsPage extends Page {
  checkOnPage() {
    throw new Error('Method not implemented.')
  }

  constructor() {
    super('Adjudication data')
  }

  checkChartTitle(value: string): void {
    cy.get('h2').should('contain', value)
  }

  checkLastModifiedDate(value: string): void {
    cy.get('p').should('contain', `Date updated: ${value}`)
  }
}
