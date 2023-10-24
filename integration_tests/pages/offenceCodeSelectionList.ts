import Page, { PageElement } from './page'

export default class OffenceCodeSelectionListPage extends Page {
  constructor(title: string) {
    super(title)
  }

  radios = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  radio = (value: string) => this.radios().find(`input[value="${value}"]`)

  radioLabelFromValue = (value: string) => this.radio(value).siblings('label').should('have.length', 1)

  radioLabelFromText = (text: string) => cy.get('label').contains(text)

  continue = (): PageElement => cy.get('[data-qa="continue"]')

  cancel = (): PageElement => cy.get('[data-qa="cancel"]')

  form = (): PageElement => cy.get('[data-qa="offence-paragraph-list-form"]')
}
