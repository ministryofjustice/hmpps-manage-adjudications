import IncidentDetails from '../pages/incidentDetails'
import Page from '../pages/page'

import datePickerDriver from '../componentDrivers/datePickerDriver'

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
    cy.task('stubStartNewDraftAdjudication', {
      draftAdjudication: {
        id: 3456,
        incidentDetails: {
          dateTimeOfIncident: '2021-11-03T11:09:42',
          locationId: 234,
        },
        incidentStatement: {},
        prisonerNumber: 'G6415GD',
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
        name: 'Test User',
        username: 'USER1',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(`/incident-details/G6415GD`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.datePicker().should('exist')
    incidentDetailsPage.timeInputHours().should('exist')
    incidentDetailsPage.timeInputMinutes().should('exist')
    incidentDetailsPage.locationSelector().should('exist')
    incidentDetailsPage.submitButton().should('exist')
  })
  it('should show error if a date is not selected', () => {
    cy.visit(`/incident-details/G6415GD`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().type('12')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter date of incident')
      })
  })
  it('should show error if one of the time fields is not filled in correctly', () => {
    const today = new Date()
    cy.visit(`/incident-details/G6415GD`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter time of incident')
      })
  })
  it('should show error if a location is not selected', () => {
    const today = new Date()
    cy.visit(`/incident-details/G6415GD`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('12')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select location of incident')
      })
  })
  it('should submit form successfully if all data entered', () => {
    const today = new Date()
    cy.visit(`/incident-details/G6415GD`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('12')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.submitButton().click()
  })
  it('should redirect the user to /incident-statement if form is incomplete', () => {
    const today = new Date()
    cy.visit(`/incident-details/G6415GD`)
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('03')
    incidentDetailsPage.timeInputMinutes().type('20')
    incidentDetailsPage.locationSelector().select('Workshop 19 - Braille')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-statement/G6415GD/3456')
    })
  })
})
