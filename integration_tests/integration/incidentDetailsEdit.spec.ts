import IncidentDetails from '../pages/incidentDetailsEdit'
import Page from '../pages/page'

context('Incident details (edit) - statement incomplete', () => {
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
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER1',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25b',
          },
        },
      },
    })
    cy.task('stubEditDraftIncidentDetails', {
      id: 34,
      response: {
        draftAdjudication: {
          id: 34,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 27029,
          },
          incidentStatement: {},
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER2',
          incidentRole: {
            roleCode: '25a',
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
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: {
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
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
          lastName: 'JONES',
          prisonerNumber: 'T3356FU',
          prisonName: 'HMP Moorland',
        },
      ],
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('exist')
    incidentDetailsPage.reportingOfficerName().should('exist')
    incidentDetailsPage.datePicker().should('exist')
    incidentDetailsPage.timeInputHours().should('exist')
    incidentDetailsPage.timeInputMinutes().should('exist')
    incidentDetailsPage.locationSelector().should('exist')
    incidentDetailsPage.radioButtons().should('exist')
    incidentDetailsPage.radioButtonLegend().should('exist')
    incidentDetailsPage.submitButton().should('exist')
    incidentDetailsPage.exitButton().should('exist')
  })
  it('should show the correct reporting officer - the original creator of the report', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('contain.text', 'Reporting officer')
    incidentDetailsPage.reportingOfficerName().should('contain.text', 'USER ONE')
  })
  it('should show error if one of the time fields is not filled in correctly', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().clear()
    incidentDetailsPage.timeInputMinutes().clear()
    incidentDetailsPage.timeInputHours().type('13')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter time of incident')
      })
  })
  it('should show error if a location is not selected', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.locationSelector().select('Select')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select location of incident')
      })
  })
  it('should show the prisoners name in the radio button question', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtonLegend().should('contain.text', 'What was John Smith’s role in the incident?')
  })
  it('should submit form successfully if radio button changed from one which requires an associated prisoner PRN to one which does not', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtons().find('input[value="attemptOnTheirOwn"]').check()
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/offence-details/G6415GD/34')
    })
  })
  it('should submit form successfully if radio button changed from one which does not require an associated prisoner PRN to one which does', () => {
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
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER1',
          incidentRole: {
            roleCode: '25a',
          },
        },
      },
    })
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtons().find('input[value="inciteAnotherPrisoner"]').check()
    incidentDetailsPage.conditionalInputIncite().type('T3356FU')
    incidentDetailsPage.searchButtonIncite().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    cy.location().should(loc => {
      expect(loc.search).to.eq('?selectedPerson=T3356FU')
    })
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/offence-details/G6415GD/34')
    })
  })
  it('should error if the user has changed the radio button but not searched for the associated prisoner', () => {
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
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER1',
          incidentRole: {},
        },
      },
    })
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtons().find('input[value="assistAnotherPrisoner"]').check()
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter their name or prison number')
      })
    incidentDetailsPage.conditionalInputAssist().type('T3356FU')
    incidentDetailsPage.searchButtonAssist().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    cy.location().should(loc => {
      expect(loc.search).to.eq('?selectedPerson=T3356FU')
    })
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/offence-details/G6415GD/34')
    })
  })
  it('should submit form successfully if all data entered and redirect to /offence-details page - change time', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().clear()
    incidentDetailsPage.timeInputHours().type('13')
    incidentDetailsPage.timeInputMinutes().clear()
    incidentDetailsPage.timeInputMinutes().type('00')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/offence-details/G6415GD/34')
    })
  })
  it('should submit form successfully if all data entered and redirect to /offence-details page - change location', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/offence-details/G6415GD/34')
    })
  })
  it('should remember the changed location and time once it comes back to this page from the search page', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().clear()
    incidentDetailsPage.timeInputHours().type('15')
    incidentDetailsPage.timeInputMinutes().clear()
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('27008')
    incidentDetailsPage.radioButtons().find('input[value="assistAnotherPrisoner"]').check()
    incidentDetailsPage.conditionalInputAssist().type('T3356FU')
    incidentDetailsPage.searchButtonAssist().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    cy.location().should(loc => {
      expect(loc.search).to.eq('?selectedPerson=T3356FU')
    })
    incidentDetailsPage.timeInputHours().should('have.value', '15')
    incidentDetailsPage.timeInputMinutes().should('have.value', '30')
    incidentDetailsPage.locationSelector().should('have.value', '27008')
    incidentDetailsPage.radioButtons().find('input[value="assistAnotherPrisoner"]').should('be.checked')
    incidentDetailsPage.prisonerNameAssist().contains('Jones, James')
    incidentDetailsPage.prisonerPrnAssist().contains('T3356FU')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/offence-details/G6415GD/34')
    })
  })
  it('should remember the changed location and time once it comes back to this page after deleting an associated prisoner', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().clear()
    incidentDetailsPage.timeInputHours().type('13')
    incidentDetailsPage.timeInputMinutes().clear()
    incidentDetailsPage.timeInputMinutes().type('00')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.inciteAssociatedPrisonerDeleteButton().click()
    cy.get('[data-qa="radio-buttons"]').find('input[value="yes"]').check()
    cy.get('[data-qa="delete-person-submit"]').click()
    incidentDetailsPage.timeInputHours().should('have.value', '13')
    incidentDetailsPage.timeInputMinutes().should('have.value', '00')
    incidentDetailsPage.locationSelector().contains('Workshop 2')
    incidentDetailsPage.radioButtons().find('input[value="inciteAnotherPrisoner"]').should('be.checked')
  })
  it('should redirect to the task list page if the user exists the page', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/G6415GD/34')
    })
  })
})
