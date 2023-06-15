import PrisonerSearch from '../pages/prisonerSearch'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

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
        expect($errors.get(0).innerText).to.contain('Enter the prisoner’s name or number')
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
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          enhanced: false,
        }),
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
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          enhanced: false,
        }),
      ],
    })

    cy.visit(adjudicationUrls.searchForPrisoner.root)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.searchTermInput().type('A1234AA')
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage.errorSummary().should('not.exist')
    prisonerSearchPage.resultsRows().should('have.length', 1)
  })

  it('should show results for number search with transfers on', () => {
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'A1234AA',
        prisonIds: [],
      },
      results: [
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          enhanced: false,
          prisonId: 'LEI',
        }),
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          prisonId: 'MDI',
          enhanced: false,
        }),
      ],
    })

    cy.visit(`${adjudicationUrls.searchForPrisoner.root}?transfer=true`)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.searchTermInput().type('A1234AA')
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage.errorSummary().should('not.exist')
    prisonerSearchPage.resultsRows().should('have.length', 1)
  })

  it('should have the correct href for the start a report link', () => {
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        lastName: 'Smith',
        prisonIds: ['MDI'],
      },
      results: [
        testData.prisonerSearchSummary({
          firstName: 'John',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          enhanced: false,
          gender: 'Unknown',
        }),
        testData.prisonerSearchSummary({
          firstName: 'James',
          lastName: 'Smith',
          prisonerNumber: 'A1234AB',
          enhanced: false,
        }),
      ],
    })

    cy.visit(adjudicationUrls.searchForPrisoner.root)
    const prisonerSearchPage: PrisonerSearch = Page.verifyOnPage(PrisonerSearch)
    prisonerSearchPage.searchTermInput().type('Smith')
    prisonerSearchPage.submitButton().click()
    prisonerSearchPage.errorSummary().should('not.exist')
    prisonerSearchPage
      .resultsTable()
      .find('td')
      .then($data => {
        expect($data.get(5).innerHTML).to.contain('/incident-details/A1234AB')
        expect($data.get(11).innerHTML).to.contain('/select-gender/A1234AA')
      })
  })
})
