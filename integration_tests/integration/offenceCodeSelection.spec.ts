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
        categoryCode: 'C',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
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
})
