import PrisonerSearch from '../pages/prisonerSearch'
import Page from '../pages/page'

context('Prisoner Search', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(`/search-for-prisoner`)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.submitButton().should('exist')
    prisonerSearchPage.searchTermInput().should('exist')
  })

  it('should show validation message if there is no input', () => {
    cy.visit(`/search-for-prisoner`)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter a name or prison number')
      })
  })
})
