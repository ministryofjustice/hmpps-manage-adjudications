import Page, { PageElement } from './page'

export default class PunishmentsAndDamagesPage extends Page {
  constructor() {
    super('Adjudication for report')
  }

  moneyCautionSummary = (): PageElement => cy.get('[data-qa="money-caution-summary"]')

  punishmentsTabName = (): PageElement => cy.get('[data-qa="punishmentsTab"]')
}
