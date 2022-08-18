import Page, { PageElement } from './page'

export default class Damages extends Page {
  constructor() {
    super('Damages')
  }

  damagesTable = (): PageElement => cy.get('[data-qa="damages-table"]')

  noDamagesP1 = (): PageElement => cy.get('[data-qa="no-damages-p1"]')

  noDamagesP2 = (): PageElement => cy.get('[data-qa="no-damages-p2"]')

  removeLink = (damageIndex: number): PageElement => cy.get(`[data-qa="delete-${damageIndex}"]`)

  addDamagesButton = (): PageElement => cy.get('[data-qa="add-damages-button"]')

  saveAndContinue = (): PageElement => cy.get('[data-qa="details-of-damages-submit"]')

  exitButton = (): PageElement => cy.get('[data-qa="exit-damages-button"]')

  addDamageType = (): PageElement => cy.get('[data-qa="add-damages-radio-buttons"]')

  addDamageDescription = (): PageElement => cy.get('[data-qa="add-damages-description"]')

  addDamageSubmit = (): PageElement => cy.get('[data-qa="add-damages-submit"]')
}
