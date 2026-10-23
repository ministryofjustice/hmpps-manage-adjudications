import Page, { PageElement } from './page'

export default class PunishmentDurationPage extends Page {
  constructor() {
    super('and start date')
  }

  caption = (): PageElement => cy.get('[data-qa="punishment-caption"]')

  heading = (): PageElement => cy.get('[data-qa="punishment-duration-heading"]')

  appliesTo = (): PageElement => cy.get('[data-qa="applies-to"]')

  days = (): PageElement => cy.get('[data-qa="duration"]')

  startMode = (): PageElement => cy.get('[data-qa="start-mode-radio-buttons"]')

  startDate = (): PageElement => cy.get('[data-qa="startDate"]')

  suspendedUntil = (): PageElement => cy.get('[data-qa="suspendedUntil"]')

  submitButton = (): PageElement => cy.get('[data-qa="submit"]')

  cancel = (): PageElement => cy.get('[data-qa="cancel"]')

  errorSummary = (): PageElement => cy.get('[data-qa="error-summary"]')
}
