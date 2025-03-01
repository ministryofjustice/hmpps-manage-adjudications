import IncidentDetails from '../pages/incidentDetails'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()

context('Incident details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubStartNewDraftAdjudication', {
      draftAdjudication: testData.draftAdjudication({
        id: 3456,
        dateTimeOfIncident: '2021-11-03T11:09:42',
        locationId: 25538,
        prisonerNumber: 'G6415GD',
        incidentRole: {
          associatedPrisonersNumber: 'T3356FU',
          roleCode: '25b',
        },
      }),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      draftAdjudication: testData.draftAdjudication({
        id: 3456,
        dateTimeOfIncident: '2021-11-03T11:09:42',
        locationId: 25538,
        prisonerNumber: 'G6415GD',
        incidentRole: {
          associatedPrisonersNumber: 'T3356FU',
          roleCode: '25b',
        },
      }),
    })
    cy.task('stubGetLocations', {
      prisonId: 'MDI',
      response: testData.residentialLocationsFromLocationsApi(),
    })

    cy.task('stubGetNomisLocationId', {})

    cy.task('stubGetNomisLocationId', {
      dpsLocationId: 'location-2',
      response: {
        nomisLocationId: 25538,
        dpsLocationId: 'location-2',
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'James',
        lastName: 'Jones',
      }),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'A5155DY',
      response: testData.prisonerResultSummary({
        offenderNo: 'A5155DY',
        firstName: 'TOBY',
        lastName: 'PERCROSS',
      }),
    })
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'T3356FU',
        prisonIds: ['MDI'],
      },
      results: [testData.prisonerSearchSummary({ firstName: 'JAMES', lastName: 'JONES', prisonerNumber: 'T3356FU' })],
    })
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'A5155DY',
        prisonIds: ['MDI'],
      },
      results: [
        testData.prisonerSearchSummary({
          firstName: 'TOBY',
          lastName: 'PERCROSS',
          prisonerNumber: 'A5155DY',
        }),
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
    incidentDetailsPage.datePickerDiscovery().should('exist')
    incidentDetailsPage.timeInputHoursDiscovery().should('exist')
    incidentDetailsPage.timeInputMinutesDiscovery().should('exist')
    incidentDetailsPage.radioButtonsDiscovery().should('exist')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="Yes"]').should('not.be.checked')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').should('not.be.checked')
  })
  it('should show the correct reporting officer - the original creator of the report', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('contain.text', 'Reporting officer')
    incidentDetailsPage.reportingOfficerName().should('contain.text', 'Test User')
  })
  it('should show error if a date is not selected', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().type('01')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="Yes"]').click()
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the date of the incident')
      })
  })
  it('should show error if one of the time fields is not filled in correctly - 1', () => {
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')

    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="Yes"]').click()
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the time of the incident')
      })
  })
  it('should show error if a location is not selected', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('01')
    incidentDetailsPage.timeInputMinutes().type('30')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="Yes"]').click()
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select the location of the incident')
      })
  })
  it('should redirect the user to /age-of-prisoner/ if form is complete', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('03')
    incidentDetailsPage.timeInputMinutes().type('20')
    incidentDetailsPage.locationSelector().select('Houseblock 2')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="Yes"]').click()
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    })
  })

  it('should show error if discovery radio is not selected', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('11')
    incidentDetailsPage.timeInputMinutes().type('22')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select yes if the incident was discovered at the same time')
      })
  })

  it('should show error if discovery radio is selected but no date input', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('11')
    incidentDetailsPage.timeInputMinutes().type('22')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the date of the incident discovery')
      })
  })

  it('should show error if discovery radio is selected but no times input', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('11')
    incidentDetailsPage.timeInputMinutes().type('22')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    incidentDetailsPage.datePickerDiscovery().type(date)
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the time of the discovery')
      })
  })

  it('should show error if discovery radio is selected but no hour input', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('11')
    incidentDetailsPage.timeInputMinutes().type('22')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    incidentDetailsPage.datePickerDiscovery().type(date)
    incidentDetailsPage.timeInputMinutesDiscovery().type('59')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the time of the discovery')
      })
  })

  it('should show error if discovery radio is selected but bad hour input', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('11')
    incidentDetailsPage.timeInputMinutes().type('22')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    incidentDetailsPage.datePickerDiscovery().type(date)
    incidentDetailsPage.timeInputHoursDiscovery().type('24')
    incidentDetailsPage.timeInputMinutesDiscovery().type('59')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter an incident discovery hour between 00 and 23')
      })
  })

  it('should show error if discovery radio is selected but bad minute input', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('11')
    incidentDetailsPage.timeInputMinutes().type('22')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    incidentDetailsPage.datePickerDiscovery().type(date)
    incidentDetailsPage.timeInputHoursDiscovery().type('23')
    incidentDetailsPage.timeInputMinutesDiscovery().type('x59')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the discovery minute between 00 and 59')
      })
  })

  it('should show error if discovery radio is selected but future date input', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('11')
    incidentDetailsPage.timeInputMinutes().type('22')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    const tomorrow = new Date()
    tomorrow.setDate(new Date().getDate() + 1)
    incidentDetailsPage.datePickerDiscovery().type(formatDateForDatePicker(tomorrow.toISOString(), 'short'))
    incidentDetailsPage.timeInputHoursDiscovery().type('23')
    incidentDetailsPage.timeInputMinutesDiscovery().type('59')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('The incident discovery time must be in the past')
      })
  })

  it('should redirect correctly if discovery radio is selected and date / time set and submitted', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    const date = formatDateForDatePicker(new Date().toISOString(), 'short')
    incidentDetailsPage.datePicker().type(date)
    incidentDetailsPage.timeInputHours().type('00')
    incidentDetailsPage.timeInputMinutes().type('01')
    incidentDetailsPage.locationSelector().select('Houseblock 1')
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    incidentDetailsPage.datePickerDiscovery().type(date)
    incidentDetailsPage.timeInputHoursDiscovery().type('00')
    incidentDetailsPage.timeInputMinutesDiscovery().type('01')
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
      cy.visit(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      const date = formatDateForDatePicker(new Date().toISOString(), 'short')
      incidentDetailsPage.datePicker().type(date)
      incidentDetailsPage.timeInputHours().type('01')
      incidentDetailsPage.timeInputMinutes().type('30')
      incidentDetailsPage.locationSelector().select('Houseblock 1')
      incidentDetailsPage.radioButtonsDiscovery().find('input[value="Yes"]').click()
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
