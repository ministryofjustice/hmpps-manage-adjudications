import DeletePerson from '../pages/deletePerson'
import Page from '../pages/page'

context('Delete person - page contents', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: {
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
        categoryCode: 'C',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
      },
    })

    cy.task('stubGetUserFromUsername', {
      username: 'TEST_GEN',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'TEST_GEN',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.task('stubGetEmail', {
      username: 'TEST_GEN',
      response: {
        username: 'TEST_GEN',
        email: 'test@justice.gov.uk',
        verified: true,
      },
    })

    cy.signIn()
  })
  it('should contain the required page elements - prn provided', () => {
    cy.visit(`/delete-person?associatedPersonId=G6415GD`)
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.radioButtons().should('exist')
    DeletePersonPage.radioButtonLegend().should('exist')
    DeletePersonPage.radioButtonLegend().contains('Do you want to delete John Smith?')
    DeletePersonPage.submitButton().should('exist')
    DeletePersonPage.errorSummary().should('not.exist')
  })
  it('should contain the required page elements - username provided', () => {
    cy.visit(`/delete-person?associatedPersonId=TEST_GEN`)
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.radioButtons().should('exist')
    DeletePersonPage.radioButtonLegend().should('exist')
    DeletePersonPage.radioButtonLegend().contains('Do you want to delete Test User?')
    DeletePersonPage.submitButton().should('exist')
    DeletePersonPage.errorSummary().should('not.exist')
  })
  it('should show error message if no radio is selected', () => {
    cy.visit(`/delete-person?associatedPersonId=G6415GD`)
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.submitButton().click()
    DeletePersonPage.errorSummary().should('exist')
    DeletePersonPage.errorSummary().contains('Select yes if you want to delete this person.')
  })
})

context('Delete person - full journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: {
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
        categoryCode: 'C',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
      },
    })

    cy.task('stubGetUserFromUsername', {
      username: 'TEST_GEN',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'TEST_GEN',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.task('stubGetEmail', {
      username: 'TEST_GEN',
      response: {
        username: 'TEST_GEN',
        email: 'test@justice.gov.uk',
        verified: true,
      },
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6123VU',
      response: {
        offenderNo: 'G6123VU',
        firstName: 'JAMES',
        lastName: 'JONES',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
        categoryCode: 'C',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 34,
      response: {
        draftAdjudication: {
          id: 34,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T13:10:00',
            handoverDeadline: '2021-11-05T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          prisonerNumber: 'G6123VU',
          startedByUserId: 'USER1',
          incidentRole: {
            associatedPrisonersNumber: 'G6415GD',
            roleCode: '25b',
          },
        },
      },
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: [
        {
          locationId: 27029,
          agencyId: 'MDI',
          userDescription: 'Workshop 19 - Braille',
        },
        {
          locationId: 27008,
          agencyId: 'MDI',
          userDescription: 'Workshop 2',
        },
        {
          locationId: 27009,
          agencyId: 'MDI',
          userDescription: 'Workshop 3 - Plastics',
        },
        {
          locationId: 27010,
          agencyId: 'MDI',
          userDescription: 'Workshop 4 - PICTA',
        },
      ],
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'USER ONE',
        username: 'USER1',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.signIn()
  })
  it('should redirect to redirectUrl with correct query attached - yes selected', () => {
    // start on previous page to place redirectUrl on to session
    cy.visit(`/incident-details/G6123VU/34/edit`)
    cy.get('[data-qa="incite-prisoner-delete"]').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/delete-person')
      expect(loc.search).to.eq('?associatedPersonId=G6415GD')
    })
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.radioButtons().find('input[value="yes"]').check()
    DeletePersonPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-details/G6123VU/34/edit')
      expect(loc.search).to.eq('?personDeleted=true')
    })
  })
  it('should redirect to redirectUrl with correct query attached - no selected', () => {
    // start on previous page to place redirectUrl on to session
    cy.visit(`/incident-details/G6123VU/34/edit`)
    cy.get('[data-qa="incite-prisoner-delete"]').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/delete-person')
      expect(loc.search).to.eq('?associatedPersonId=G6415GD')
    })
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.radioButtons().find('input[value="no"]').check()
    DeletePersonPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-details/G6123VU/34/edit')
      expect(loc.search).to.eq('?selectedPerson=G6415GD')
    })
  })
})
