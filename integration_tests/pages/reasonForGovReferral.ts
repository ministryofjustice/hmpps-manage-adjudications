import Page, { PageElement } from './page'

export default class ReasonForGovReferral extends Page {
  constructor() {
    super('Why has this case been referred back to the governor?')
  }

  referralRadios = (): PageElement => cy.get('[data-qa="referGovReason-radio-buttons"]')

  referralReason = (): PageElement => cy.get('[data-qa="referral-reason"]')

  submitButton = (): PageElement => cy.get('[data-qa="reason-for-gov-referral-submit"]')
}
