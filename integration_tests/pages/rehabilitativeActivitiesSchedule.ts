import Page, { PageElement } from './page'

export default class RehabilitativeActivitiesSchedulePage extends Page {
  constructor() {
    super('Rehabilitative schedule')
  }

  schedule = (index: number): PageElement => cy.get(`[data-qa="rehabilitative-schedule-${index}"]`)

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')
}
