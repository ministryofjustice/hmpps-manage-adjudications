import Page, { PageElement } from './page'

export default class DataInsightsPage extends Page {
  constructor() {
    super('Adjudication data')
  }

  checkChartTitle(value: string): void {
    cy.get('h2').should('contain', value)
  }

  checkLastModifiedDate(value: string): void {
    cy.get('p').should('contain', `Date updated: ${value}`)
  }

  selectCharacteristic = () => cy.get('[data-qa="characteristic-selector"]')

  showResultsButton = (): PageElement => cy.get('[data-qa="show-results-submit"]')

  ageReadEvidenceLink = (): PageElement => cy.get('[data-qa="age-read-evidence-link"]')

  learningDisabilityReadEvidenceLink = (): PageElement => cy.get('[data-qa="learning-disability-read-evidence-link"]')

  maturityReadEvidenceLink = (): PageElement => cy.get('[data-qa="maturity-read-evidence-link"]')
}
