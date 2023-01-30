import Page, { PageElement } from './page'

export default class HearingReasonForReferral extends Page {
  constructor() {
    super('What is the reason for the referral?')
  }

  referralReason = (): PageElement => cy.get('[data-qa="referral-reason"]')

  submitButton = (): PageElement => cy.get('[data-qa="reason-for-referral-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')

  cancelButton = (): PageElement => cy.get('[data-qa="reason-for-referral-cancel"]')
}
