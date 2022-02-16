import Page, { PageElement } from './page'

export default class DeletePersonPage extends Page {
  constructor() {
    super('Do you want to delete')
  }

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  radioButtonLegend = (): PageElement => cy.get('legend')

  submitButton = (): PageElement => cy.get('[data-qa="delete-person-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
