import Page, { PageElement } from './page'

export default class Home extends Page {
  constructor() {
    super('This site is under construction...')
  }

  signInName = (): PageElement => cy.get('[data-qa="sign-in-name"]')

  activeLocation = (): PageElement => cy.get('[data-qa="active-location"]')
}
