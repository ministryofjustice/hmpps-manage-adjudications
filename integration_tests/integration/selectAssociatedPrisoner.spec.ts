import SelectAssociatedPrisoner from '../pages/selectAssociatedPrisoner'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'

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
          {
            cellLocation: '1-2-015',
            firstName: 'JAMES',
            lastName: 'Smith',
            prisonerNumber: 'T3356FU',
            prisonName: 'HMP Moorland',
          },
        ],
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=T3356FU`)
      const SelectAssociatedPrisonerPage: SelectAssociatedPrisoner = Page.verifyOnPage(SelectAssociatedPrisoner)

      SelectAssociatedPrisonerPage.searchTermInput().should('exist')
      SelectAssociatedPrisonerPage.resultsTable().should('exist')
      SelectAssociatedPrisonerPage.noResultsMessage().should('not.exist')
    })
    it('should contain the required page elements', () => {
      cy.visit(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=T3356FU`)
      const SelectAssociatedPrisonerPage: SelectAssociatedPrisoner = Page.verifyOnPage(SelectAssociatedPrisoner)

      SelectAssociatedPrisonerPage.resultsTable()
        .find('th')
        .then($headings => {
          expect($headings.get(1).innerText).to.contain('Name')
          expect($headings.get(2).innerText).to.contain('Prison number')
          expect($headings.get(3).innerText).to.contain('Location')
        })

      SelectAssociatedPrisonerPage.resultsTable()
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
          {
            cellLocation: '1-2-016',
            firstName: 'Cedric',
            lastName: 'Jones',
            prisonerNumber: 'G6123UP',
            prisonName: 'HMP Moorland',
          },
          {
            cellLocation: '1-2-017',
            firstName: 'Shaun',
            lastName: 'Jones',
            prisonerNumber: 'F7123VB',
            prisonName: 'HMP Moorland',
          },
        ],
      })
      cy.visit(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=T3356FU`)
      const SelectAssociatedPrisonerPage: SelectAssociatedPrisoner = Page.verifyOnPage(SelectAssociatedPrisoner)
      SelectAssociatedPrisonerPage.searchTermInput().clear().type('Jones')
      SelectAssociatedPrisonerPage.submitButton().click()
      SelectAssociatedPrisonerPage.resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(1).innerText).to.contain('Jones, Cedric')
          expect($data.get(2).innerText).to.contain('G6123UP')
          expect($data.get(3).innerText).to.contain('1-2-016')
          expect($data.get(4).innerText).to.contain('Select prisoner')
          expect($data.get(6).innerText).to.contain('Jones, Shaun')
          expect($data.get(7).innerText).to.contain('F7123VB')
          expect($data.get(8).innerText).to.contain('1-2-017')
          expect($data.get(9).innerText).to.contain('Select prisoner')
        })
    })
    it('should show error message if nothing is entered into search box on submit', () => {
      cy.visit(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=T3356FU`)
      const SelectAssociatedPrisonerPage: SelectAssociatedPrisoner = Page.verifyOnPage(SelectAssociatedPrisoner)
      SelectAssociatedPrisonerPage.searchTermInput().clear()
      SelectAssociatedPrisonerPage.submitButton().click()
      SelectAssociatedPrisonerPage.resultsTable().should('not.exist')
      SelectAssociatedPrisonerPage.errorSummary().should('exist')
      SelectAssociatedPrisonerPage.errorSummary().should('contain', 'Enter a prisoner’s name or number')
    })
  })
})
