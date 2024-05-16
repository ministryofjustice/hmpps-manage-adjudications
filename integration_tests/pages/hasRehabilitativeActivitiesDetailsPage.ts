import Page, { PageElement } from './page'

export default class HasRehabilitativeActivitesDetailsPage extends Page {
  constructor() {
    super('Do you have the details of the rehabilitative activity?')
  }

  detailsChoice = (): PageElement => cy.get('[data-qa="hasRehabilitativeActivitiesDetails-radios"]')

  submitButton = (): PageElement => cy.get('[data-qa="punishment-submit"]')

  cancel = (): PageElement => cy.get('[data-qa="punishment-cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
