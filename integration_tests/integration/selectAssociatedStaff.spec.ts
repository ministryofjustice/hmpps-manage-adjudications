import SelectAssociatedStaff from '../pages/selectAssociatedStaff'
import OffenceCodeSelection from '../pages/offenceCodeSelection'
import Page from '../pages/page'

context('Select associated staff', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    // Committed draft
    cy.task('stubGetDraftAdjudication', {
      id: 100,
      response: {
        draftAdjudication: {
          id: 100,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T13:10:00',
            handoverDeadline: '2021-11-05T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER1',
          incidentRole: {
            associatedPrisonersNumber: undefined,
            roleCode: undefined,
          },
        },
      },
    })
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: {
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    // Staff Member
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
    // Staff Member
    cy.task('stubGetUserFromUsername', {
      username: 'BSMITH_GEN',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Bob Smith',
        username: 'BSMITH_GEN',
        authSource: 'auth',
      },
    })
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
  it.only('returns to the previous page with the selected staff member details', () => {
    cy.visit(`/offence-code-selection/100/committed/1`)
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio('1-1-1-3').check()
    whoWasAssaultedPage.victimStaffSearchFirstNameInput().type('Bob')
    whoWasAssaultedPage.victimStaffSearchLastNameInput().type('Smith')
    whoWasAssaultedPage.searchStaff().click()
    const SelectStaffMemberPage = new SelectAssociatedStaff()
    cy.url().should('include', '/select-associated-staff?staffFirstName=Bob&staffLastName=Smith')
    SelectStaffMemberPage.selectStaffMemberLink().click()
    cy.url().should(
      'include',
      '/offence-code-selection/100/committed/1-1-1?selectedAnswerId=1-1-1-3&selectedPerson=BSMITH_GEN'
    )
  })
})
