import Page, { PageElement } from './page'

export default class PunishmentCommentDeletePage extends Page {
  constructor() {
    super('Do you want to remove this comment?')
  }

  subtitleCommentText = (): PageElement => cy.get('[data-qa="subtitle-comment-text"]')

  comment = (): PageElement => cy.get('[data-qa="comment-to-remove"]')

  radioButtons = (): PageElement => cy.get('[data-qa="radio-buttons-remove-comment"]')

  submitButton = (): PageElement => cy.get('[data-qa="remove-comment-submit"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
