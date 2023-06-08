import Page, { PageElement } from './page'

export default class IsThePrisonerStillInThisEstablishmentPage extends Page {
  constructor() {
    super('Is the prisoner still in this establishment?')
  }

  radios = (): PageElement => cy.get('[data-qa="still-in-establishment-radio-buttons"]')

  radioYes = (): PageElement => cy.get('#stillInEstablishment')

  radioNo = (): PageElement => cy.get('#stillInEstablishment-2')

  submitButton = (): PageElement => cy.get('[data-qa="still-in-establishment-submit"]')
}
