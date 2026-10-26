import Page, { PageElement } from './page'

export default class HasRehabilitativeActivitesDetailsPage extends Page {
  constructor() {
    // matches both "activity?" and "activities?", as the heading depends on how many punishments it covers
    super('Do you have the details of the rehabilitative activit')
  }

  detailsChoice = (): PageElement => cy.get('[data-qa="hasRehabilitativeActivitiesDetails-radios"]')

  numberOfActivities = (): PageElement => cy.get('[data-qa="number-of-activities"]')

  appliesTo = (): PageElement => cy.get('[data-qa="applies-to"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="punishment-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
