import Page, { PageElement } from './page'

export default class AgeOfPrisonerPage extends Page {
  constructor() {
    super('Age of the prisoner')
  }

  ageOfPrisoner = (): PageElement => cy.get('[data-qa="age-of-prisoner"]')

  prisonRuleRadios = (): PageElement => cy.get('[data-qa="age-of-prisoner-radio-buttons"]')

  radioYoi = (): PageElement => cy.get('#whichRuleChosen')

  radioAdult = (): PageElement => cy.get('#whichRuleChosen-2')

  submitButton = (): PageElement => cy.get('[data-qa="age-of-prisoner-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="age-of-prisoner-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
