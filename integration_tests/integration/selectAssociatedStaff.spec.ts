import SelectAssociatedStaff from '../pages/selectAssociatedStaff'
import Page from '../pages/page'

context('Continue a report - select report', () => {
  context('with data', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.task('stubAuthUser')
      cy.task('stubGetUserFromNames', {
        staffFirstName: 'Bob',
        staffLastName: 'Smith',
        response: [
          {
            email: 'bsmith@justice.gov.uk',
            firstName: 'Bob',
            lastName: 'Smith',
            name: 'Bob Smith',
            username: 'BSMITH_GEN',
            activeCaseLoadId: 'MDI',
          },
        ],
      })
      cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`/select-associated-staff?staffFirstName=Bob&staffLastName=Smith`)
      const selectAssociatedStaffPage: SelectAssociatedStaff = Page.verifyOnPage(SelectAssociatedStaff)

      selectAssociatedStaffPage.resultsTable().should('exist')
      selectAssociatedStaffPage.noResultsMessage().should('not.exist')
    })
  })
})
