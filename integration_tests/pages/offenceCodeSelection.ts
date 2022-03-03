import Page, { PageElement } from './page'

export default class OffenceCodeSelection extends Page {
  constructor(title: string) {
    super(title)
  }

  radios = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  radio = (value: string) => this.radios().find(`input[value="${value}"]`)

  radioLabel = (value: string) => this.radio(value).siblings('label').should('have.length', 1)

  continue = (): PageElement => cy.get('[data-qa="offence-code-decision-continue"]')

  form = (): PageElement => cy.get('[data-qa="offence-code-decision-form"]')
}
