import Page, { PageElement } from './page'

export default class OffenceCodeSelection extends Page {
  constructor(title: string) {
    super(title)
  }

  radios = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  radio = (value: string) => this.radios().find(`input[value="${value}"]`)

  radioLabel = (value: string) => this.radio(value).siblings('label').should('have.length', 1)

  continue = (): PageElement => cy.get('[data-qa="offence-code-decision-continue"]')

  form = (): PageElement => cy.get('[data-qa="offence-code-decision-form"]')

  victimPrisonerSearchInput = (): PageElement => cy.get('input[id="prisonerSearchNameInput"]')

  victimPrisonerHiddenInput = (): PageElement => cy.get('input[id="prisonerId"]')

  victimPrisonerName = (): PageElement => cy.get('[data-qa="victim-prisoner-name"]')

  victimOfficerSearchFirstNameInput = (): PageElement => cy.get('input[id="officerSearchFirstNameInput"]')

  victimOfficerSearchLastNameInput = (): PageElement => cy.get('input[id="officerSearchLastNameInput"]')

  victimOfficerPrisonerHiddenInput = (): PageElement => cy.get('input[id="officerId"]')

  victimOfficerName = (): PageElement => cy.get('[data-qa="victim-officer-name"]')

  search = (): PageElement => cy.get('button[name="searchUser"]').filter(':visible')

  delete = (): PageElement => cy.get('button[name="deleteUser"]')

  simulateReturnFromPrisonerSearch = (questionId: string, selectedAnswerId: string, prisonerId: string) =>
    cy.visit(
      `/offence-code-selection/100/committed/${questionId}?selectedAnswerId=${selectedAnswerId}&selectedPerson=${prisonerId}`
    )

  simulateReturnFromStaffSearch = (questionId: string, selectedAnswerId: string, staffId: string) =>
    cy.visit(
      `/offence-code-selection/100/committed/${questionId}?selectedAnswerId=${selectedAnswerId}&selectedPerson=${staffId}`
    )
}
