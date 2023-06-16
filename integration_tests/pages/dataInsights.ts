import Page from './page'

export default class DataInsightsPage extends Page {
  constructor() {
    super('Adjudication data')
  }

  checkChartTitle(value: string): void {
    cy.get('h2').should('contain', value)
  }
}
