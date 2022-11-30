import Page, { PageElement } from './page'

export default class PrisonerGenderPage extends Page {
  constructor() {
    super('What is the gender of the prisoner?')
  }

  hint = (): PageElement => cy.get('[data-qa="select-gender-hint"]')

  radios = (): PageElement => cy.get('[data-qa="select-gender-radio-buttons"]')

  radioFemale = (): PageElement => cy.get('#genderSelected')

  radioMale = (): PageElement => cy.get('#genderSelected-2')

  submitButton = (): PageElement => cy.get('[data-qa="select-gender-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="select-gender-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
