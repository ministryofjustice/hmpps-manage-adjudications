import adjudicationUrls from '../../server/utils/urlGenerator'
import IncidentDetails from '../pages/incidentDetailsEdit'
import Page from '../pages/page'
import { forceDateInputWithDate, forceDateInput } from '../componentDrivers/dateInput'
import { PrisonerGender } from '../../server/data/DraftAdjudicationResult'

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
            dateTimeOfDiscovery: '2021-11-03T13:10:00',
            handoverDeadline: '2021-11-05T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          prisonerNumber: 'G6415GD',
          gender: PrisonerGender.MALE,
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
          gender: PrisonerGender.MALE,
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
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('exist')
    incidentDetailsPage.reportingOfficerName().should('exist')
    incidentDetailsPage.datePicker().should('exist')
    incidentDetailsPage.timeInputHours().should('exist')
    incidentDetailsPage.timeInputMinutes().should('exist')
    incidentDetailsPage.locationSelector().should('exist')
    incidentDetailsPage.submitButton().should('exist')
    incidentDetailsPage.exitButton().should('exist')
    incidentDetailsPage.radioButtonsDiscovery().should('exist')
  })
  it('should not contain any discovery details if No is selected', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    incidentDetailsPage.timeInputHoursDiscovery().should('have.value', '')
    incidentDetailsPage.timeInputMinutesDiscovery().should('have.value', '')
    incidentDetailsPage.datePickerDiscovery().should('have.value', '')
  })
  it('should show the correct reporting officer - the original creator of the report', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('contain.text', 'Reporting officer')
    incidentDetailsPage.reportingOfficerName().should('contain.text', 'USER ONE')
  })
  it('should show error if one of the time fields is not filled in correctly', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().clear()
    incidentDetailsPage.timeInputMinutes().clear()
    incidentDetailsPage.timeInputHours().type('13')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the time of the incident')
      })
  })
  it('should show error if a location is not selected', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.locationSelector().select('Select')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select the location of the incident')
      })
  })
  it('should submit form successfully if all data entered and redirect to applicable rule page (if no offences on report) - change time', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().clear()
    incidentDetailsPage.timeInputHours().type('13')
    incidentDetailsPage.timeInputMinutes().clear()
    incidentDetailsPage.timeInputMinutes().type('00')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.start(34))
    })
  })
  it('should submit form successfully if all data entered and redirect to applicable rule page (if no offences on report) - change location', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.locationSelector().select('Workshop 2')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.ageOfPrisoner.urls.start(34))
    })
  })
  it('should redirect to the task list page if the user exits the page', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(34))
    })
  })
  context('Redirect on error', () => {
    beforeEach(() => {
      cy.task('stubEditDraftIncidentDetails', { id: 34, response: {}, status: 500 })
    })
    it('should redirect back to incident details (edit) if an error occurs whilst calling the API', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.timeInputHours().clear()
      incidentDetailsPage.timeInputHours().type('14')
      incidentDetailsPage.timeInputMinutes().clear()
      incidentDetailsPage.timeInputMinutes().type('00')
      incidentDetailsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.not.eq(adjudicationUrls.taskList.urls.start(34))
      })
      incidentDetailsPage.errorContinueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      })
      incidentDetailsPage.timeInputHours().should('have.value', '13')
      incidentDetailsPage.timeInputMinutes().should('have.value', '10')
    })
  })
  context('Offences already on report', () => {
    beforeEach(() => {
      cy.task('stubGetDraftAdjudication', {
        id: 34,
        response: {
          draftAdjudication: {
            id: 34,
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T13:10:00',
              dateTimeOfDiscovery: '2021-11-03T13:10:00',
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
            offenceDetails: [
              {
                offenceCode: 16001,
                offenceRule: {
                  paragraphNumber: '16',
                  paragraphDescription:
                    'Intentionally or recklessly sets fire to any part of a prison or any other property, whether or not their own',
                },
              },
            ],
          },
        },
      })
    })
    it('should submit form successfully if all data entered and redirect to offence details page - change time', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.timeInputHours().clear()
      incidentDetailsPage.timeInputHours().type('13')
      incidentDetailsPage.timeInputMinutes().clear()
      incidentDetailsPage.timeInputMinutes().type('00')
      incidentDetailsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfOffence.urls.start(34))
      })
    })
    it('should submit form successfully if all data entered and redirect to offence details page - change location', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.locationSelector().select('Workshop 2')
      incidentDetailsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.detailsOfOffence.urls.start(34))
      })
    })
    it('DISCOVERY : confirm radio button is Yes if DISCOVERY date/time equal as INCIDENT date/time ', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.radioButtonsDiscovery().find('input[value="Yes"]').should('be.checked')
    })
    it('should fail to submit as Hours is cleared with appropriate message', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
      incidentDetailsPage.timeInputHoursDiscovery().clear()
      incidentDetailsPage.submitButton().click()
      incidentDetailsPage
        .errorSummary()
        .find('li')
        .then($errors => {
          expect($errors.get(0).innerText).to.contain('Enter the date of the incident discovery')
        })
    })
    it('DISCOVERY : should submit successfully if "No" radio option selected and date/time filled correctly', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
      incidentDetailsPage.timeInputHoursDiscovery().clear()
      incidentDetailsPage.timeInputHoursDiscovery().type('13')
      incidentDetailsPage.timeInputMinutesDiscovery().clear()
      incidentDetailsPage.timeInputMinutesDiscovery().type('00')
      incidentDetailsPage.submitButton().click()
      cy.location().should(() => {
        adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34)
      })
    })
    it('DISCOVERY : should fail to submit if "No" radio option selected and date/time filled incorrectly', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
      incidentDetailsPage.submitButton().click()
      incidentDetailsPage
        .errorSummary()
        .find('li')
        .then($errors => {
          expect($errors.get(0).innerText).to.contain('Enter the date of the incident discovery')
        })
    })
  })
  it('DISCOVERY : should fail to submit if the "No" radio option selected and discovery date/time before incident date/time', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()

    forceDateInput(10, 10, 2010, '[data-qa="discovery-details-date"]')

    incidentDetailsPage.timeInputHoursDiscovery().clear()
    incidentDetailsPage.timeInputHoursDiscovery().type('09')
    incidentDetailsPage.timeInputMinutesDiscovery().clear()
    incidentDetailsPage.timeInputMinutesDiscovery().type('00')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('The discovery date must be after the incident date')
      })
  })
  it('DISCOVERY : should fail to submit if the "No" radio option selected and discovery time before incident time, but dates are the same', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()

    forceDateInput(10, 10, 2010, '[data-qa="incident-details-date"]')
    forceDateInput(10, 10, 2010, '[data-qa="discovery-details-date"]')

    incidentDetailsPage.timeInputHoursDiscovery().clear()
    incidentDetailsPage.timeInputHoursDiscovery().type('00')
    incidentDetailsPage.timeInputMinutesDiscovery().clear()
    incidentDetailsPage.timeInputMinutesDiscovery().type('01')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('The discovery time must be after the incident time')
      })
  })
  it('DISCOVERY : should fail to submit if "No" radio option selected and hour filled incorrectly', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    forceDateInputWithDate(new Date(), '[data-qa="discovery-details-date"]')
    incidentDetailsPage.timeInputHoursDiscovery().clear()
    incidentDetailsPage.timeInputHoursDiscovery().type('23')
    incidentDetailsPage.timeInputMinutesDiscovery().clear()
    incidentDetailsPage.timeInputMinutesDiscovery().type('999')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the discovery minute between 00 and 59')
      })
  })
  it('DISCOVERY : should fail to submit if "No" radio option selected and minute filled incorrectly', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
    forceDateInputWithDate(new Date(), '[data-qa="discovery-details-date"]')
    incidentDetailsPage.timeInputHoursDiscovery().clear()
    incidentDetailsPage.timeInputHoursDiscovery().type('13')
    incidentDetailsPage.timeInputMinutesDiscovery().clear()
    incidentDetailsPage.timeInputMinutesDiscovery().type('00x')
    incidentDetailsPage.submitButton().click()
    incidentDetailsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the discovery minute between 00 and 59')
      })
  })
  context('Tests Discovery date differengt to incident date', () => {
    beforeEach(() => {
      cy.task('stubGetDraftAdjudication', {
        id: 34,
        response: {
          draftAdjudication: {
            id: 34,
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T13:10:00',
              dateTimeOfDiscovery: '2021-11-04T13:10:00',
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
            offenceDetails: [
              {
                offenceCode: 16001,
                offenceRule: {
                  paragraphNumber: '16',
                  paragraphDescription:
                    'Intentionally or recklessly sets fire to any part of a prison or any other property, whether or not their own',
                },
              },
            ],
          },
        },
      })
    })
    it('DISCOVERY : should comfirm DICOVERY button to No if DISCOVERY date/time is different to INCIDENT date/time ', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').should('be.checked')
    })
  })
})
