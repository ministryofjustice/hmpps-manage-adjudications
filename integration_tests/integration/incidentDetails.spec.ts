import IncidentDetails from '../pages/incidentDetails'
import Page, { PageElement } from '../pages/page'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import datePickerDriver from '../componentDrivers/datePickerDriver'
import adjudicationUrls from '../../server/utils/urlGenerator'

// In order to bypass the date picker we force the input to accept text and then press escape so the date picker
// disappears allowing us to interact with other fields.
const forceDateInput = (day: number, month: number, year: number): PageElement =>
  cy
    .get('[data-qa="incident-details-date"]')
    .clear({ force: true })
    .type(`${`0${day}`.slice(-2)}/${`0${month}`.slice(-2)}/${year}{esc}`, { force: true })

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
    incidentDetailsPage.radioButtons().should('exist')
    incidentDetailsPage.radioButtonLegend().should('exist')
    incidentDetailsPage.submitButton().should('exist')
  })
  it('should show the correct reporting officer - the original creator of the report', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('contain.text', 'Reporting officer')
    incidentDetailsPage.reportingOfficerName().should('contain.text', 'USER ONE')
  })
  it('should show the prisoners name in the radio button question', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtonLegend().should('contain.text', 'What was John Smith’s role in the incident?')
  })
  it('should show error if a date is not selected', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
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
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    // datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
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
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    // datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
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
  it('should submit form successfully if all data entered - no associated prisoner required', () => {
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
          roleCode: '25a',
        },
      },
    })
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    // datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('12')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.radioButtons().find('input[value="attempted"]').check()
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(3456, 'attempted', '1'))
    })
  })
  it('should submit form successfully if all data entered - associated prisoner required - prisoner incited', () => {
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    // datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('12')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.radioButtons().find('input[value="incited"]').check()
    incidentDetailsPage.conditionalInputIncite().type('T3356FU')
    incidentDetailsPage.searchButtonIncite().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(3456, 'incited', '1'))
    })
  })
  it('should submit form successfully if all data entered - associated prisoner required - prisoner assisted', () => {
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
          roleCode: '25c',
        },
      },
    })
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    // datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('12')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.radioButtons().find('input[value="assisted"]').check()
    incidentDetailsPage.conditionalInputAssist().type('T3356FU')
    incidentDetailsPage.searchButtonAssist().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(3456, 'assisted', '1'))
    })
  })
  it('should submit form successfully with correct data if the user changes their radio selection after searching', () => {
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    // datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('12')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.radioButtons().find('input[value="assisted"]').check()
    incidentDetailsPage.conditionalInputAssist().type('T3356FU')
    incidentDetailsPage.searchButtonAssist().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentDetailsPage.radioButtons().find('input[value="incited"]').check()
    incidentDetailsPage.conditionalInputIncite().type('A5155DY')
    incidentDetailsPage.searchButtonIncite().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    cy.location().should(loc => {
      expect(loc.search).to.eq('?selectedPerson=A5155DY')
    })
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(3456, 'incited', '1'))
    })
  })
  it('should show error summary if an associated prisoner is not entered', () => {
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    // datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('12')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.radioButtons().find('input[value="assisted"]').check()
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter their name or prison number')
      })
  })
  it('should redirect the user to /offence-code-selection/ if form is incomplete', () => {
    const today = new Date()
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    // datePickerDriver(cy).pickDate(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
    incidentDetailsPage.timeInputHours().type('03')
    incidentDetailsPage.timeInputMinutes().type('20')
    incidentDetailsPage.locationSelector().select('Workshop 19 - Braille')
    incidentDetailsPage.radioButtons().find('input[value="committed"]').check()
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(3456, 'committed', '1'))
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
      forceDateInput(today.getUTCDate(), today.getUTCMonth(), today.getUTCFullYear())
      // datePickerDriver(cy).pickDate(today.getUTCDate() - 2, today.getUTCMonth(), today.getUTCFullYear())
      incidentDetailsPage.timeInputHours().type('12')
      incidentDetailsPage.timeInputMinutes().type('30')
      incidentDetailsPage.locationSelector().select('Workshop 2')
      incidentDetailsPage.radioButtons().find('input[value="attempted"]').check()
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
      incidentDetailsPage.radioButtons().should('have.value', '')
    })
  })
})
