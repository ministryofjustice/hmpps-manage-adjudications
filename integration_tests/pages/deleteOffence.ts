import Page, { PageElement } from './page'

export default class DeleteOffence extends Page {
  constructor() {
    super('Do you want to remove this offence?')
  }

  offenceDetailsSummary = (): PageElement => cy.get('[data-qa="offence-summary-table"]')

  noRadio = (): PageElement => cy.get('[data-qa="no-radio"]')

  yesRadio = (): PageElement => cy.get('[data-qa="yes-radio"]')

  confirm = (): PageElement => cy.get('[data-qa="delete-offence-submit"]')

  form = (): PageElement => cy.get('[data-qa="delete-offence-form"]')
}
