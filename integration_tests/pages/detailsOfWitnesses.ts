import adjudicationUrls from '../../server/utils/urlGenerator'
import Page, { PageElement } from './page'

export default class Witnesses extends Page {
  constructor() {
    super('Witnesses')
  }

  witnessesTable = (): PageElement => cy.get('[data-qa="witnesses-table"]')

  noWitnessesP1 = (): PageElement => cy.get('[data-qa="no-witnesses-p1"]')

  noWitnessesP2 = (): PageElement => cy.get('[data-qa="no-witnesses-p2"]')

  removeLink = (witnessIndex: number): PageElement => cy.get(`[data-qa="delete-${witnessIndex}"]`)

  addWitnessButton = (): PageElement => cy.get('[data-qa="add-witness-button"]')

  saveAndContinue = (): PageElement => cy.get('[data-qa="details-of-witness-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="details-of-witness-exit"]')

  addWitnessType = (): PageElement => cy.get('[data-qa="add-witness-radio-buttons"]')

  witnessOfficerSearchFirstNameInput = (): PageElement => cy.get('input[id="officerSearchFirstNameInput"]')

  witnessOfficerSearchLastNameInput = (): PageElement => cy.get('input[id="officerSearchLastNameInput"]')

  witnessOfficerHiddenInput = (): PageElement => cy.get('input[id="officerId"]')

  witnessOfficerName = (): PageElement => cy.get('[data-qa="officer-name"]')

  witnessStaffSearchFirstNameInput = (): PageElement => cy.get('input[id="staffSearchFirstNameInput"]')

  witnessStaffSearchLastNameInput = (): PageElement => cy.get('input[id="staffSearchLastNameInput"]')

  witnessStaffHiddenInput = (): PageElement => cy.get('input[id="staffId"]')

  witnessStaffName = (): PageElement => cy.get('[data-qa="staff-name"]')

  witnessOtherFirstNameInput = (): PageElement => cy.get('input[id="otherPersonFirstNameInput"]')

  witnessOtherLastNameInput = (): PageElement => cy.get('input[id="otherPersonLastNameInput"]')

  searchStaff = (): PageElement => cy.get('button[data-qa="staff-search"]')

  searchOfficer = (): PageElement => cy.get('button[data-qa="officer-search"]')

  delete = (): PageElement => cy.get('button[name="deleteUser"]')

  simulateReturnFromOfficerSearch = (adjudicationId: number, selectedAnswerId: string, officerId: string) =>
    cy.visit(
      `${adjudicationUrls.detailsOfWitnesses.urls.add(
        adjudicationId
      )}?selectedAnswerId=${selectedAnswerId}&selectedPerson=${officerId}`
    )

  simulateReturnFromStaffSearch = (adjudicationId: number, selectedAnswerId: string, staffId: string) =>
    cy.visit(
      `${adjudicationUrls.detailsOfWitnesses.urls.add(
        adjudicationId
      )}?selectedAnswerId=${selectedAnswerId}&selectedPerson=${staffId}`
    )

  addWitnessSubmit = (): PageElement => cy.get('[data-qa="add-witness-submit"]')
}
