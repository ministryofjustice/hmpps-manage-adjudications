import adjudicationUrls from '../../server/utils/urlGenerator'
import Page, { PageElement } from './page'

export default class OffenceCodeSelection extends Page {
  constructor(title: string) {
    super(title)
  }

  radios = (): PageElement => cy.get('[data-qa="radio-buttons"]')

  checkboxes = (): PageElement => cy.get('[data-qa="checkboxes"]')

  radio = (value: string) => this.radios().find(`input[value="${value}"]`)

  checkbox = (value: string) => this.checkboxes().find(`input[value="${value}"]`)

  radioLabelFromValue = (value: string) => this.radio(value).siblings('label').should('have.length', 1)

  radioLabelFromText = (text: string) => cy.get('label').contains(text)

  continue = (): PageElement => cy.get('[data-qa="offence-code-decision-continue"]')

  continueCheckboxes = (): PageElement => cy.get('[data-qa="offence-code-protected-characteristics-continue"]')

  cancel = (): PageElement => cy.get('[data-qa="offence-code-decision-cancel"]')

  form = (): PageElement => cy.get('[data-qa="offence-code-decision-form"]')

  victimPrisonerSearchInput = (): PageElement => cy.get('input[id="prisonerSearchNameInput"]')

  victimPrisonerHiddenInput = (): PageElement => cy.get('input[id="prisonerId"]')

  victimPrisonerName = (): PageElement => cy.get('[data-qa="victim-prisoner-name"]')

  victimOfficerSearchNameInput = (): PageElement => cy.get('input[id="officerSearchNameInput"]')

  victimOfficerPrisonerHiddenInput = (): PageElement => cy.get('input[id="officerId"]')

  victimOfficerName = (): PageElement => cy.get('[data-qa="victim-officer-name"]')

  victimPersonOutsideEstablishmentSearchNameInput = (): PageElement =>
    cy.get('input[id="prisonerOutsideEstablishmentNameInput"]')

  victimPersonOutsideEstablishmentSearchNumberInput = (): PageElement =>
    cy.get('input[id="prisonerOutsideEstablishmentNumberInput"]')

  victimOtherPersonSearchNameInput = (): PageElement => cy.get('input[id="otherPersonNameInput"]')

  victimStaffSearchNameInput = (): PageElement => cy.get('input[id="staffSearchNameInput"]')

  prisonerOutsideEstablishmentNameInput = (): PageElement => cy.get('input[id="prisonerOutsideEstablishmentNameInput"]')

  prisonerOutsideEstablishmentNumberInput = (): PageElement =>
    cy.get('input[id="prisonerOutsideEstablishmentNumberInput"]')

  searchStaff = (): PageElement => cy.get('button[data-qa="staff-search"]')

  searchOfficer = (): PageElement => cy.get('button[data-qa="officer-search"]')

  searchPrisoner = (): PageElement => cy.get('button[data-qa="prisoner-search"]')

  delete = (): PageElement => cy.get('button[name="deleteUser"]')

  simulateReturnFromPrisonerSearch = (
    adjudicationId: number,
    questionId: string,
    selectedAnswerId: string,
    prisonerId: string
  ) =>
    cy.visit(
      `${adjudicationUrls.offenceCodeSelection.urls.question(
        adjudicationId,
        'committed',
        questionId
      )}?selectedAnswerId=${selectedAnswerId}&selectedPerson=${prisonerId}`
    )

  simulateReturnFromStaffSearch = (
    adjudicationId: number,
    questionId: string,
    selectedAnswerId: string,
    staffId: string
  ) =>
    cy.visit(
      `${adjudicationUrls.offenceCodeSelection.urls.question(
        adjudicationId,
        'committed',
        questionId
      )}?selectedAnswerId=${selectedAnswerId}&selectedPerson=${staffId}`
    )

  checkOffenceCode = (offenceCode: number, text: string): PageElement =>
    cy.get('label').contains(text).siblings(`input[offenceCode="${offenceCode}"]`).should('exist')
}
