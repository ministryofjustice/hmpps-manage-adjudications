import Page, { PageElement } from './page'

export default class PunishmentsAndDamagesPage extends Page {
  constructor() {
    super('Adjudication for charge')
  }

  punishmentsTabName = (): PageElement => cy.get('[data-qa="punishmentsTab"]')

  awardPunishmentsTable = (): PageElement => cy.get('[data-qa="punishments-table"]')

  damagesTable = (): PageElement => cy.get('[data-qa="damages-table"]')

  changePunishmentsButton = (): PageElement => cy.get('[data-qa="change-punishments"]')

  awardPunishmentsButton = (): PageElement => cy.get('[data-qa="award-punishments"]')

  reportQuashedButton = (): PageElement => cy.get('[data-qa="report-quashed-guilty-finding"]')

  quashedWarning = (): PageElement => cy.get('[data-qa="quashed-warning"]')

  noPunishments = (): PageElement => cy.get('[data-qa="no-punishments"]')

  punishmentCommentsSection = (): PageElement => cy.get('[data-qa="punishment-comments-section"]')

  punishmentCommentsTable = (): PageElement => cy.get('[data-qa="punishment-comments-table"]')

  changePunishmentCommentLink = (): PageElement => cy.get('[data-qa="change-punishment-comment-1"]')

  removePunishmentCommentLink = (): PageElement => cy.get('[data-qa="remove-punishment-comment-1"]')

  addPunishmentCommentButton = (): PageElement => cy.get('[data-qa="add-punishment-comment"]')

  rehabActivitiesTable = (): PageElement => cy.get('[data-qa="rehabilitative-activities-table"]')
}
