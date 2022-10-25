import Page, { PageElement } from './page'

export default class Evidence extends Page {
  constructor() {
    super('Evidence')
  }

  photoVideoTable = (): PageElement => cy.get('[data-qa="photoVideoTable-evidence-table"]')

  baggedAndTaggedTable = (): PageElement => cy.get('[data-qa="baggedAndTaggedTable-evidence-table"]')

  noEvidence = (): PageElement => cy.get('[data-qa="no-evidence"]')

  noPhotoVideoEvidence = (): PageElement => cy.get('[data-qa="no-photoVideo-evidence"]')

  noBaggedAndTaggedEvidence = (): PageElement => cy.get('[data-qa="no-baggedAndTagged-evidence"]')

  removeLink = (isBaggedAndTagged: boolean, evidenceIndex: number): PageElement =>
    cy.get(`[data-qa="delete-${isBaggedAndTagged ? 'baggedAndTaggedTable' : 'photoVideoTable'}-${evidenceIndex}"]`)

  addEvidenceButton = (): PageElement => cy.get('[data-qa="add-evidence-button"]')

  saveAndContinue = (): PageElement => cy.get('[data-qa="details-of-evidence-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="exit-evidence-button"]')

  addEvidenceType = (): PageElement => cy.get('[data-qa="add-evidence-radio-buttons"]')

  addEvidenceDescription = (): PageElement => cy.get('[data-qa="add-evidence-description"]')

  addSealNumber = (): PageElement => cy.get('[data-qa="add-bat-id"]')

  addBWCNumber = (): PageElement => cy.get('[data-qa="add-bwc-id"]')

  addEvidenceSubmit = (): PageElement => cy.get('[data-qa="add-evidence-submit"]')
}
