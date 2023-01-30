import Page, { PageElement } from './page'

export default class HearingReferralConfirmation extends Page {
  constructor() {
    super('Referral saved')
  }

  panelSubText = (): PageElement => cy.get('.govuk-panel__body')

  heading1 = (): PageElement => cy.get('[data-qa="h2-1"]')

  heading2 = (): PageElement => cy.get('[data-qa="h2-2"]')

  para1 = (): PageElement => cy.get('[data-qa="p-1"]')

  para2 = (): PageElement => cy.get('[data-qa="p-2"]')

  list = (): PageElement => cy.get('[data-qa="list"]')

  returnLink = (): PageElement => cy.get('[data-qa="hearing-referral-confirmation-return-link"]')
}
