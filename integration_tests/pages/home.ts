import Page, { PageElement } from './page'

export default class Home extends Page {
  constructor() {
    super('Place a prisoner on report')
  }

  signInName = (): PageElement => cy.get('[data-qa="sign-in-name"]')

  activeLocation = (): PageElement => cy.get('[data-qa="active-location"]')
}
