import IncidentDetails from '../pages/incidentDetailsEdit'
import Page from '../pages/page'

context('Incident details', () => {
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
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          prisonerNumber: 'G6415GD',
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
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.datePicker().should('exist')
    incidentDetailsPage.timeInputHours().should('exist')
    incidentDetailsPage.timeInputMinutes().should('exist')
    incidentDetailsPage.locationSelector().should('exist')
    incidentDetailsPage.submitButton().should('exist')
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
  it('should submit form successfully if all data entered', () => {
    cy.visit(`/incident-details/G6415GD/34/edit`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().clear()
    incidentDetailsPage.timeInputHours().type('13')
    incidentDetailsPage.timeInputMinutes().clear()
    incidentDetailsPage.timeInputMinutes().type('00')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-statement/G6415GD/34')
    })
  })
})
