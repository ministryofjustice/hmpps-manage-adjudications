import Page, { PageElement } from './page'

export default class ErrorPage extends Page {
  constructor(title: string) {
    super(title)
  }

  continue = (): PageElement => cy.get('[data-qa="continue-after-error"]')
}
