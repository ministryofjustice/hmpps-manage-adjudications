import Page, { PageElement } from './page'

export default class ConfirmedOnReportChangeReportPage extends Page {
  constructor() {
    super('report has been changed')
  }

  finishLink = (): PageElement => cy.get('[data-qa="confirmed-on-report-finish"]')
}
