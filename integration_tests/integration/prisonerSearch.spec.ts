import PrisonerSearch from '../pages/prisonerSearch'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'

context('Prisoner Search', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.searchForPrisoner.root)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.submitButton().should('exist')
    prisonerSearchPage.searchTermInput().should('exist')
  })

  it('should show validation message if there is no input', () => {
    cy.visit(adjudicationUrls.searchForPrisoner.root)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter a prisoner’s name or number')
      })
  })

  it('should show results for name search', () => {
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        lastName: 'Smith',
        prisonIds: ['MDI'],
      },
      results: [
        {
          cellLocation: '1-2-015',
          firstName: 'JOHN',
          lastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonName: 'HMP Moorland',
        },
      ],
    })

    cy.visit(adjudicationUrls.searchForPrisoner.root)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.searchTermInput().type('Smith')
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage.errorSummary().should('not.exist')
    prisonerSearchPage.resultsRows().should('have.length', 1)
  })

  it('should show results for number search', () => {
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'A1234AA',
        prisonIds: ['MDI'],
      },
      results: [
        {
          cellLocation: '1-2-015',
          firstName: 'JOHN',
          lastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonName: 'HMP Moorland',
        },
      ],
    })

    cy.visit(adjudicationUrls.searchForPrisoner.root)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.searchTermInput().type('A1234AA')
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage.errorSummary().should('not.exist')
    prisonerSearchPage.resultsRows().should('have.length', 1)
  })
})
