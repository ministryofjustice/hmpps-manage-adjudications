import Page, { PageElement } from './page'

export default class ReasonForGovReferral extends Page {
  constructor() {
    super('What is the reason for not having an independent adjudicator hearing?')
  }

  referralReason = (): PageElement => cy.get('[data-qa="referral-reason"]')

  submitButton = (): PageElement => cy.get('[data-qa="reason-for-gov-referral-submit"]')
}
