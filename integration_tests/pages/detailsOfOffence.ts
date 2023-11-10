import Page, { PageElement } from './page'

export default class DetailsOfOffence extends Page {
  constructor() {
    super('Offence details')
  }

  prisonerNameDiv = (): PageElement => cy.get('[data-qa="playback-offender-name"]')

  offenceDetailsSummary = (): PageElement => cy.get('[data-qa="offence-summary-table"]')

  deleteLink = (offenceIndex: number): PageElement => cy.get(`[data-qa="delete-${offenceIndex}"]`)

  saveAndContinue = (): PageElement => cy.get('[data-qa="details-of-offence-submit"]')

  continue = (): PageElement => cy.get('[data-qa="details-of-offence-continue"]')
}
