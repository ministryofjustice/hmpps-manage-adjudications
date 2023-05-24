import Page, { PageElement } from './page'

export default class PunishmentCommentPage extends Page {
  constructor() {
    super('Add a comment about punishment')
  }

  punishmentComment = (): PageElement => cy.get('[data-qa="edit-punishment-comment"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-comment-submit"]')

  cancelButton = (): PageElement => cy.get('[data-qa="punishment-comment-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
