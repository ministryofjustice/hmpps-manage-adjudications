import OffenceCodeSelection from '../pages/offenceCodeSelection'

context('Incident details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
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
    // Attempted draft
    cy.task('stubGetDraftAdjudication', {
      id: 101,
      response: {
        draftAdjudication: {
          id: 101,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-04T13:10:00',
            handoverDeadline: '2021-11-06T13:10:00',
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
            roleCode: '25a',
          },
        },
      },
    })
    // Incited draft
    cy.task('stubGetDraftAdjudication', {
      id: 102,
      response: {
        draftAdjudication: {
          id: 102,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-05T13:10:00',
            handoverDeadline: '2021-11-07T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER1',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25b',
          },
        },
      },
    })
    // Assisted draft
    cy.task('stubGetDraftAdjudication', {
      id: 103,
      response: {
        draftAdjudication: {
          id: 103,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-06T13:10:00',
            handoverDeadline: '2021-11-08T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER1',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25c',
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
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: {
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: {
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    // Prison officer victim
    cy.task('stubGetUserFromUsername', {
      username: 'AOWENS',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Adam Owens',
        username: 'AOWENS',
        authSource: 'auth',
      },
    })
    cy.task('stubGetEmail', {
      username: 'AOWENS',
      response: {
        username: 'AOWENS',
        email: 'aowens@justice.gov.uk',
      },
    })
  })

  it('the first page for committing an offence title', () => {
    cy.visit(`/offence-code-selection/100/committed/1`)
    new OffenceCodeSelection('What type of offence did John Smith commit?').checkOnPage()
    cy.visit(`/offence-code-selection/101/attempted/1`)
    new OffenceCodeSelection('What type of offence did John Smith attempt to commit?').checkOnPage()
    cy.visit(`/offence-code-selection/102/incited/1`)
    new OffenceCodeSelection('What type of offence did John Smith incite another prisoner to commit?').checkOnPage()
    cy.visit(`/offence-code-selection/103/assisted/1`)
  })

  it('the first page should have the expected radios', () => {
    cy.visit(`/offence-code-selection/100/committed/1`)
    // These are very specific to the current decision data so don't check too many.
    const committedPage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    committedPage.radios().should('exist')
    committedPage.radio('1-1').should('exist')
    committedPage
      .radioLabel('1-1')
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    committedPage.radio('1-1').should('exist')
    committedPage
      .radioLabel('1-9')
      .contains('Being absent without authorisation, being in an unauthorised place, or failing to work correctly')
  })

  it('check validation when there is no radio selected', () => {
    cy.visit(`/offence-code-selection/100/committed/1`)
    const committedPage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    committedPage.continue().click()
    committedPage.form().contains('Please make a choice')
  })

  it('select another radio and check that we get sent to the page we expect', () => {
    cy.visit(`/offence-code-selection/100/committed/1`)
    // This is specific to the current decision data so only check one.
    const committedPage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    committedPage.radio('1-1').should('exist').check()
    committedPage
      .radioLabel('1-1')
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    // Go to the next page
    committedPage.continue().click()
    committedPage.radio('1-1-1').should('exist')
    committedPage.radioLabel('1-1-1').contains('Assaulting someone')
  })

  it('select a prisoner question', () => {
    const prisonerAnswerId = '1-1-1-1'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(`/offence-code-selection/100/committed/${whoWasAssaultedQuestionId}`)
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(prisonerAnswerId).check()
    whoWasAssaultedPage.radioLabel(prisonerAnswerId).contains('Another prisoner')
    whoWasAssaultedPage.victimPrisonerSearchInput().type('Paul Wright')
    whoWasAssaultedPage.search().click()
    cy.url().should('include', 'select-associated-prisoner?searchTerm=Paul%20Wright')
    whoWasAssaultedPage.simulateReturnFromPrisonerSearch(whoWasAssaultedQuestionId, prisonerAnswerId, 'G5512G')
    whoWasAssaultedPage.victimPrisonerHiddenInput().should('have.value', 'G5512G')
    whoWasAssaultedPage.victimPrisonerName().contains('Paul Wright')
    whoWasAssaultedPage.continue().click()
    const wasTheIncidentRacial = new OffenceCodeSelection('Was the incident a racially aggravated assault?')
    wasTheIncidentRacial.checkOnPage()
  })

  it('select a prisoner question - delete', () => {
    const prisonerAnswerId = '1-1-1-1'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(`/offence-code-selection/100/committed/${whoWasAssaultedQuestionId}`)
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.simulateReturnFromPrisonerSearch(whoWasAssaultedQuestionId, prisonerAnswerId, 'G5512G')
    whoWasAssaultedPage.victimPrisonerHiddenInput().should('have.value', 'G5512G')
    whoWasAssaultedPage.delete().click()
    whoWasAssaultedPage.victimPrisonerSearchInput().should('exist')
  })

  it('select a prisoner question - validation', () => {
    const prisonerAnswerId = '1-1-1-1'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(`/offence-code-selection/100/committed/${whoWasAssaultedQuestionId}`)
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(prisonerAnswerId).check()
    // Search without search text for validation
    whoWasAssaultedPage.search().click()
    whoWasAssaultedPage.form().contains('Enter their name or prison number')
    // Enter search text and submit instead of searching
    whoWasAssaultedPage.victimPrisonerSearchInput().type('Paul Wright')
    whoWasAssaultedPage.continue().click()
    whoWasAssaultedPage.form().contains('Search for a prisoner')
    whoWasAssaultedPage.victimPrisonerSearchInput().should('have.value', 'Paul Wright')
  })

  it('select an officer question', () => {
    const officerAnswerId = '1-1-1-2'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(`/offence-code-selection/100/committed/${whoWasAssaultedQuestionId}`)
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(officerAnswerId).check()
    whoWasAssaultedPage.radioLabel(officerAnswerId).contains('A prison officer')
    whoWasAssaultedPage.victimOfficerSearchFirstNameInput().type('Adam Owens')
    whoWasAssaultedPage.victimOfficerSearchLastNameInput().type('Adam Owens')
    whoWasAssaultedPage.search().click()
    cy.url().should('include', '/select-associated-staff?staffFirstName=Adam%20Owens&staffLastName=Adam%20Owens')
    whoWasAssaultedPage.simulateReturnFromStaffSearch(whoWasAssaultedQuestionId, officerAnswerId, 'AOWENS')
    whoWasAssaultedPage.victimOfficerPrisonerHiddenInput().should('have.value', 'AOWENS')
    whoWasAssaultedPage.victimOfficerName().contains('Adam Owens')
    whoWasAssaultedPage.continue().click()
    const wasTheIncidentRacial = new OffenceCodeSelection('Was the incident a racially aggravated assault?')
    wasTheIncidentRacial.checkOnPage()
  })

  it('select an officer question - delete', () => {
    const officerAnswerId = '1-1-1-2'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(`/offence-code-selection/100/committed/${whoWasAssaultedQuestionId}`)
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.simulateReturnFromStaffSearch(whoWasAssaultedQuestionId, officerAnswerId, 'AOWENS')
    whoWasAssaultedPage.victimOfficerPrisonerHiddenInput().should('have.value', 'AOWENS')
    whoWasAssaultedPage.victimOfficerName().contains('Adam Owens')
    whoWasAssaultedPage.delete().click()
    whoWasAssaultedPage.victimOfficerSearchFirstNameInput().should('exist')
  })

  it('select an officer question - validation', () => {
    const officerAnswerId = '1-1-1-2'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(`/offence-code-selection/100/committed/${whoWasAssaultedQuestionId}`)
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(officerAnswerId).check()
    // Search without search text for validation
    whoWasAssaultedPage.search().click()
    whoWasAssaultedPage.form().contains('Enter their first name')
    whoWasAssaultedPage.form().contains('Enter their last name')
    whoWasAssaultedPage.victimOfficerSearchFirstNameInput().type('Adam')
    whoWasAssaultedPage.search().click()
    whoWasAssaultedPage.form().should('not.contain', 'Enter their first name')
    whoWasAssaultedPage.form().contains('Enter their last name')
    whoWasAssaultedPage.victimOfficerSearchFirstNameInput().should('have.value', 'Adam')
    whoWasAssaultedPage.victimOfficerSearchFirstNameInput().clear()
    whoWasAssaultedPage.victimOfficerSearchLastNameInput().type('Owens')
    whoWasAssaultedPage.search().click()
    whoWasAssaultedPage.form().contains('Enter their first name')
    whoWasAssaultedPage.form().should('not.contain', 'Enter their last name')
    whoWasAssaultedPage.victimOfficerSearchLastNameInput().should('have.value', 'Owens')
    // Enter search text and submit instead of searching
    whoWasAssaultedPage.victimOfficerSearchFirstNameInput().type('Adam')
    whoWasAssaultedPage.victimOfficerSearchLastNameInput().clear()
    whoWasAssaultedPage.victimOfficerSearchLastNameInput().type('Owens')
    whoWasAssaultedPage.continue().click()
    whoWasAssaultedPage.form().contains('Search for a prison officer')
    whoWasAssaultedPage.victimOfficerSearchFirstNameInput().should('have.value', 'Adam')
    whoWasAssaultedPage.victimOfficerSearchLastNameInput().should('have.value', 'Owens')
  })
})
