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
      cy.task('stubGetEmail', {
        username: 'BSMITH_GEN',
        response: {
          username: 'BSMITH_GEN',
          email: 'bsmith@justice.gov.uk',
          verified: true,
        },
      })
      cy.signIn()
    })
    it('should contain the required page elements', () => {
      cy.visit(`/select-associated-staff?staffFirstName=Bob&staffLastName=Smith`)
      const selectAssociatedStaffPage: SelectAssociatedStaff = Page.verifyOnPage(SelectAssociatedStaff)

      selectAssociatedStaffPage.firstNameInput().should('exist')
      selectAssociatedStaffPage.lastNameInput().should('exist')
      selectAssociatedStaffPage.resultsTable().should('exist')
      selectAssociatedStaffPage.noResultsMessage().should('not.exist')
    })
    it('should contain the required page elements', () => {
      cy.visit(`/select-associated-staff?staffFirstName=Bob&staffLastName=Smith`)
      const selectAssociatedStaffPage: SelectAssociatedStaff = Page.verifyOnPage(SelectAssociatedStaff)

      selectAssociatedStaffPage
        .resultsTable()
        .find('th')
        .then($headings => {
          expect($headings.get(0).innerText).to.contain('Name')
          expect($headings.get(1).innerText).to.contain('Location')
          expect($headings.get(2).innerText).to.contain('User ID')
          expect($headings.get(3).innerText).to.contain('Email address')
        })

      selectAssociatedStaffPage
        .resultsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contain('Bob Smith')
          expect($data.get(1).innerText).to.contain('Moorland (HMP & YOI)')
          expect($data.get(2).innerText).to.contain('BSMITH_GEN')
          expect($data.get(3).innerText).to.contain('bsmith@justice.gov.uk')
          expect($data.get(4).innerText).to.contain('Select staff member')
        })
    })
  })
})
