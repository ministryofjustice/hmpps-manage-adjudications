import Page, { PageElement } from './page'

export default class ConfirmedOnReportChangeReportPage extends Page {
  constructor() {
    super('report has been changed')
  }

  finishButton = (): PageElement => cy.get('[data-qa="confirmed-on-report-finish"]')
}
