import IncidentRole from '../pages/incidentRole'
import Page from '../pages/page'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import adjudicationUrls from '../../server/utils/urlGenerator'

context('Incident role', () => {
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
    cy.task('stubGetDraftAdjudication', {
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
        },
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 134,
      response: {
        draftAdjudication: {
          id: 134,
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
    cy.task('stubUpdateDraftIncidentRole', {
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
    cy.task('stubUpdateDraftIncidentRole', {
      id: 134,
      response: {
        draftAdjudication: {
          id: 134,
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
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().should('exist')
    incidentRolePage.submitButton().should('exist')
    incidentRolePage.radioButtons().find('input[value="incited"]').should('not.be.checked')
    incidentRolePage.radioButtons().find('input[value="assisted"]').should('not.be.checked')
    incidentRolePage.radioButtons().find('input[value="committed"]').should('not.be.checked')
    incidentRolePage.radioButtons().find('input[value="attempted"]').should('not.be.checked')
  })
  it('should submit form successfully if all data entered', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="attempted"]').check()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'attempted', '1'))
    })
  })
  it('should submit form successfully if all data entered and go to associated prisoner page', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    })
  })
  it('should error if form is incomplete', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.submitButton().click()
    incidentRolePage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select the prisoner’s role in this incident')
      })
  })
  // EDIT tests moved over
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(134))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().should('exist')
    incidentRolePage.submitButton().should('exist')
    incidentRolePage.exitButton().should('exist')
  })
  context('Redirect on error', () => {
    beforeEach(() => {
      cy.task('stubUpdateDraftIncidentRole', { id: 34, response: {}, status: 500 })
    })
    it('should redirect back to incident role if an error occurs whilst calling the API', () => {
      cy.visit(adjudicationUrls.incidentRole.urls.start(34))
      const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
      incidentRolePage.radioButtons().find('input[value="attempted"]').check()
      incidentRolePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.not.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'attempted', '1'))
      })
      incidentRolePage.errorContinueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.start(34))
      })
      incidentRolePage.radioButtons().should('have.value', '')
    })
  })
})
