import adjudicationUrls from '../../server/utils/urlGenerator'
import IncidentRole from '../pages/incidentRoleEdit'
import Page from '../pages/page'

context('Incident role (edit) - statement incomplete', () => {
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
    cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().should('exist')
    incidentRolePage.radioButtonLegend().should('exist')
    incidentRolePage.submitButton().should('exist')
    incidentRolePage.exitButton().should('exist')
  })
  it('should show the prisoners name in the radio button question', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtonLegend().should('contain.text', 'What was John Smith’s role in the incident?')
  })
  it('should submit form successfully if radio button changed from one which requires an associated prisoner PRN to one which does not', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="attempted"]').check()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'attempted', '1'))
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
    cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="incited"]').check()
    incidentRolePage.conditionalInputIncite().type('T3356FU')
    incidentRolePage.searchButtonIncite().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    cy.location().should(loc => {
      expect(loc.search).to.eq('?selectedPerson=T3356FU')
    })
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'incited', '1'))
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
    cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.submitButton().click()
    incidentRolePage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter their name or prison number')
      })
    incidentRolePage.conditionalInputAssist().type('T3356FU')
    incidentRolePage.searchButtonAssist().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    cy.location().should(loc => {
      expect(loc.search).to.eq('?selectedPerson=T3356FU')
    })
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'assisted', '1'))
    })
  })
  it('should submit form successfully if all data entered and redirect to task list page - change location', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(34))
    })
  })
  it('should remember the changed location and time once it comes back to this page after deleting an associated prisoner', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.inciteAssociatedPrisonerDeleteButton().click()
    cy.get('[data-qa="radio-buttons"]').find('input[value="yes"]').check()
    cy.get('[data-qa="delete-person-submit"]').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.edit(34))
      expect(loc.search).to.eq('?personDeleted=true')
    })
    incidentRolePage.radioButtons().find('input[value="incited"]').should('be.checked')
    incidentRolePage.inciteAssociatedPrisonerDeleteButton().should('not.exist')
  })
  it('should redirect to the task list page if the user exits the page', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(34))
    })
  })
  context('Redirect on error', () => {
    beforeEach(() => {
      cy.task('stubEditDraftIncidentDetails', { id: 34, response: {}, status: 500 })
    })
    it('should redirect back to incident details (edit) if an error occurs whilst calling the API', () => {
      cy.visit(adjudicationUrls.incidentRole.urls.edit(34))
      const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
      incidentRolePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.not.eq(adjudicationUrls.taskList.urls.start(34))
      })
      incidentRolePage.errorContinueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.edit(34))
      })
    })
  })
})
