import IncidentDetails from '../pages/incidentDetails'
import Page from '../pages/page'
import { forceDateInputWithDate } from '../componentDrivers/dateInput'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import adjudicationUrls from '../../server/utils/urlGenerator'

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
          handoverDeadline: '2021-11-05T11:09:42',
          locationId: 234,
        },
        incidentStatement: {},
        prisonerNumber: 'G6415GD',
        incidentRole: {
          associatedPrisonersNumber: 'T3356FU',
          roleCode: '25b',
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
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'A5155DY',
      response: {
        offenderNo: 'A5155DY',
        firstName: 'TOBY',
        lastName: 'PERCROSS',
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
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'A5155DY',
        prisonIds: ['MDI'],
      },
      results: [
        {
          cellLocation: '1-2-015',
          firstName: 'TOBY',
          lastName: 'PERCROSS',
          prisonerNumber: 'A5155DY',
          prisonName: 'HMP Moorland',
        },
      ],
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('exist')
    incidentDetailsPage.reportingOfficerName().should('exist')
    incidentDetailsPage.datePicker().should('exist')
    incidentDetailsPage.timeInputHours().should('exist')
    incidentDetailsPage.timeInputMinutes().should('exist')
    incidentDetailsPage.locationSelector().should('exist')
    incidentDetailsPage.submitButton().should('exist')
  })
  it('should show the correct reporting officer - the original creator of the report', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('contain.text', 'Reporting officer')
    incidentDetailsPage.reportingOfficerName().should('contain.text', 'USER ONE')
  })
  it('should show error if a date is not selected', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().type('01')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the date of the incident')
      })
  })
  it('should show error if one of the time fields is not filled in correctly', () => {
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInputWithDate(today)
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the time of the incident')
      })
  })
  it('should show error if a location is not selected', () => {
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInputWithDate(today)
    incidentDetailsPage.timeInputHours().type('01')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select the location of the incident')
      })
  })
  it('should redirect the user to /age-of-prisoner/ if form is complete', () => {
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInputWithDate(today)
    incidentDetailsPage.timeInputHours().type('03')
    incidentDetailsPage.timeInputMinutes().type('20')
    incidentDetailsPage.locationSelector().select('Workshop 19 - Braille')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    })
  })
  context('Redirect on error', () => {
    beforeEach(() => {
      cy.task('stubStartNewDraftAdjudication', { response: {}, status: 500 })
    })
    it('should redirect back to incident details if an error occurs whilst calling the API', () => {
      const today = new Date()
      cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      forceDateInputWithDate(today)
      incidentDetailsPage.timeInputHours().type('01')
      incidentDetailsPage.timeInputMinutes().type('30')
      incidentDetailsPage.locationSelector().select('Workshop 2')
      incidentDetailsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.not.eq(adjudicationUrls.offenceCodeSelection.urls.question(3456, 'attempted', '1'))
      })
      incidentDetailsPage.errorContinueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
      })
      incidentDetailsPage.timeInputHours().should('have.value', '')
      incidentDetailsPage.timeInputMinutes().should('have.value', '')
      incidentDetailsPage.locationSelector().should('have.value', '')
    })
  })
})
