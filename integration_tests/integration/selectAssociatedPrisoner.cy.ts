import SelectAssociatedPrisoner from '../pages/selectAssociatedPrisoner'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

context('Select an associated prisoner', () => {
  context('with data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
      cy.task('stubSearch', {
        query: {
          includeAliases: false,
          prisonerIdentifier: 'T3356FU',
          prisonIds: ['MDI'],
        },
        results: [
          testData.prisonerSearchSummary({
            firstName: 'James',
            lastName: 'Smith',
            prisonerNumber: 'T3356FU',
            enhanced: false,
          }),
        ],
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=T3356FU`)
      const selectAssociatedPrisonerPage: SelectAssociatedPrisoner = Page.verifyOnPage(SelectAssociatedPrisoner)

      selectAssociatedPrisonerPage.searchTermInput().should('exist')
      selectAssociatedPrisonerPage.resultsTable().should('exist')
      selectAssociatedPrisonerPage.noResultsMessage().should('not.exist')
    })
    it('should contain the required page elements', () => {
      cy.visit(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=T3356FU`)
      const selectAssociatedPrisonerPage: SelectAssociatedPrisoner = Page.verifyOnPage(SelectAssociatedPrisoner)

      selectAssociatedPrisonerPage
        .resultsTable()
        .find('th')
        .then($headings => {
          expect($headings.get(1).innerText).to.contain('Name')
          expect($headings.get(2).innerText).to.contain('Prison number')
          expect($headings.get(3).innerText).to.contain('Location')
        })

      selectAssociatedPrisonerPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(1).innerText).to.contain('Smith, James')
          expect($data.get(2).innerText).to.contain('T3356FU')
          expect($data.get(3).innerText).to.contain('1-2-015')
          expect($data.get(4).innerText).to.contain('Select prisoner')
        })
    })
    it('should show new results if a new search term is added', () => {
      cy.task('stubSearch', {
        query: {
          includeAliases: false,
          lastName: 'Jones',
          prisonIds: ['MDI'],
        },
        results: [
          testData.prisonerSearchSummary({
            firstName: 'Cedric',
            lastName: 'Jones',
            prisonerNumber: 'G6123UP',
          }),
          testData.prisonerSearchSummary({
            firstName: 'Shaun',
            lastName: 'Jones',
            prisonerNumber: 'F7123VB',
          }),
        ],
      })
      cy.visit(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=T3356FU`)
      const selectAssociatedPrisonerPage: SelectAssociatedPrisoner = Page.verifyOnPage(SelectAssociatedPrisoner)
      selectAssociatedPrisonerPage.searchTermInput().clear().type('Jones')
      selectAssociatedPrisonerPage.submitButton().click()
      selectAssociatedPrisonerPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(1).innerText).to.contain('Jones, Cedric')
          expect($data.get(2).innerText).to.contain('G6123UP')
          expect($data.get(3).innerText).to.contain('1-2-015')
          expect($data.get(4).innerText).to.contain('Select prisoner')
          expect($data.get(6).innerText).to.contain('Jones, Shaun')
          expect($data.get(7).innerText).to.contain('F7123VB')
          expect($data.get(8).innerText).to.contain('1-2-015')
          expect($data.get(9).innerText).to.contain('Select prisoner')
        })
    })
    it('should show error message if nothing is entered into search box on submit', () => {
      cy.visit(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=T3356FU`)
      const selectAssociatedPrisonerPage: SelectAssociatedPrisoner = Page.verifyOnPage(SelectAssociatedPrisoner)
      selectAssociatedPrisonerPage.searchTermInput().clear()
      selectAssociatedPrisonerPage.submitButton().click()
      selectAssociatedPrisonerPage.resultsTable().should('not.exist')
      selectAssociatedPrisonerPage.errorSummary().should('exist')
      selectAssociatedPrisonerPage.errorSummary().should('contain', 'Enter the prisoner’s name or number')
    })
  })
})
