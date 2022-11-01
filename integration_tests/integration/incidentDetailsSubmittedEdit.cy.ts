import adjudicationUrls from '../../server/utils/urlGenerator'
import IncidentDetails from '../pages/incidentDetailsSubmittedEdit'
import Page from '../pages/page'

context('Incident details (edit after completion of report)', () => {
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
          adjudicationNumber: 1524455,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T13:10:00',
            dateTimeOfDiscovery: '2021-11-03T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: true,
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
            dateTimeOfDiscovery: '2021-11-03T11:09:42',
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
    cy.visit(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('exist')
    incidentDetailsPage.reportingOfficerName().should('exist')
    incidentDetailsPage.datePicker().should('exist')
    incidentDetailsPage.timeInputHours().should('exist')
    incidentDetailsPage.timeInputMinutes().should('exist')
    incidentDetailsPage.locationSelector().should('exist')
    incidentDetailsPage.submitButton().should('exist')
    incidentDetailsPage.radioButtonsDiscovery().should('exist')
  })
  it('should show the correct reporting officer - the original creator of the report', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 34))
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.reportingOfficerLabel().should('contain.text', 'Reporting officer')
    incidentDetailsPage.reportingOfficerName().should('contain.text', 'USER ONE')
  })

  it('should show error if one of the time fields is not filled in correctly', () => {
    cy.visit(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 34))
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
    cy.visit(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 34))
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
  it('should submit form successfully if all data entered and redirect to applicable rule page - reporter version', () => {
    cy.visit(
      `${adjudicationUrls.incidentDetails.urls.submittedEdit(
        'G6415GD',
        34
      )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
    )
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.timeInputHours().clear()
    incidentDetailsPage.timeInputHours().type('13')
    incidentDetailsPage.timeInputMinutes().clear()
    incidentDetailsPage.timeInputMinutes().type('00')
    incidentDetailsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(`${adjudicationUrls.ageOfPrisoner.urls.start(34)}`)
    })
  })
  it('should redirect to the prisoner report page if the user exits the page', () => {
    cy.visit(
      `${adjudicationUrls.incidentDetails.urls.submittedEdit(
        'G6415GD',
        34
      )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
    )
    const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
    incidentDetailsPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(1524455))
    })
  })
  context('Redirect on error', () => {
    beforeEach(() => {
      cy.task('stubEditDraftIncidentDetails', { id: 34, response: {}, status: 500 })
    })
    it('should redirect back to incident details (edit) if an error occurs whilst calling the API', () => {
      cy.visit(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          34
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.timeInputHours().clear()
      incidentDetailsPage.timeInputHours().type('14')
      incidentDetailsPage.timeInputMinutes().clear()
      incidentDetailsPage.timeInputMinutes().type('00')
      incidentDetailsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.not.eq(adjudicationUrls.prisonerReport.urls.report(1524455))
      })
      incidentDetailsPage.errorContinueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 34))
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
              dateTimeOfDiscovery: '2021-11-03T11:09:42',
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
      cy.visit(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          34
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.timeInputHours().clear()
      incidentDetailsPage.timeInputHours().type('00')
      incidentDetailsPage.timeInputMinutes().clear()
      incidentDetailsPage.timeInputMinutes().type('01')
      incidentDetailsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(`${adjudicationUrls.detailsOfOffence.urls.start(34)}`)
      })
    })

    it('should show no appropraite hour error if DISCOVERY radio is  selected and hour is wrong', () => {
      cy.visit(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          34
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.timeInputHoursDiscovery().clear()
      incidentDetailsPage.timeInputHoursDiscovery().type('1300')
      incidentDetailsPage.submitButton().click()
      incidentDetailsPage
        .errorSummary()
        .find('li')
        .then($errors => {
          expect($errors.get(0).innerText).to.contain('Enter an incident discovery hour between 00 and 23')
        })
    })

    it('should show no error after submit if DISCOVERY radio is  selected', () => {
      cy.visit(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          34
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.timeInputMinutesDiscovery().clear()
      incidentDetailsPage.timeInputMinutesDiscovery().type('13')
      incidentDetailsPage.timeInputHoursDiscovery().clear()
      incidentDetailsPage.timeInputHoursDiscovery().type('00')
      incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').click()
      incidentDetailsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(`${adjudicationUrls.detailsOfOffence.urls.start(34)}`)
      })
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
    it('should set DICOVERY button to "No" if DISCOVERY date is different to INCIDENT date ', () => {
      cy.visit(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      const incidentDetailsPage: IncidentDetails = Page.verifyOnPage(IncidentDetails)
      incidentDetailsPage.radioButtonsDiscovery().find('input[value="No"]').should('be.checked')
      incidentDetailsPage.datePickerDiscovery().should('have.value', '04/11/2021')
      incidentDetailsPage.timeInputHoursDiscovery().should('have.value', '13')
      incidentDetailsPage.timeInputMinutesDiscovery().should('have.value', '10')
    })
  })
})
