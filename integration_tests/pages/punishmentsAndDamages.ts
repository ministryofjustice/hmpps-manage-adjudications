import Page, { PageElement } from './page'

export default class PunishmentsAndDamagesPage extends Page {
  constructor() {
    super('Adjudication for report')
  }

  moneyCautionSummary = (): PageElement => cy.get('[data-qa="money-caution-summary"]')

  punishmentsTabName = (): PageElement => cy.get('[data-qa="punishmentsTab"]')

  awardPunishmentsTable = (): PageElement => cy.get('[data-qa="punishments-table"]')

  changePunishmentsButton = (): PageElement => cy.get('[data-qa="change-punishments"]')

  awardPunishmentsButton = (): PageElement => cy.get('[data-qa="award-punishments"]')

  reportQuashedButton = (): PageElement => cy.get('[data-qa="report-quashed-guilty-finding"]')

  quashedWarning = (): PageElement => cy.get('[data-qa="quashed-warning"]')

  noPunishments = (): PageElement => cy.get('[data-qa="no-punishments"]')
}
