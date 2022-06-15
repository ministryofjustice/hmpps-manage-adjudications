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
          incidentRole: {
            roleCode: '25a',
          },
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
    incidentRolePage.radioButtonLegend().should('exist')
    incidentRolePage.submitButton().should('exist')
  })
  it('should show the prisoners name in the radio button question', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtonLegend().should('contain.text', 'What was John Smith’s role in the incident?')
  })
  it('should submit form successfully if all data entered - no associated prisoner required', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="attempted"]').check()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'attempted', '1'))
    })
  })
  it('should submit form successfully if all data entered - associated prisoner required - prisoner incited', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="incited"]').check()
    incidentRolePage.conditionalInputIncite().type('T3356FU')
    incidentRolePage.searchButtonIncite().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'incited', '1'))
    })
  })
  it('should submit form successfully if all data entered - associated prisoner required - prisoner assisted', () => {
    cy.task('stubStartNewDraftAdjudication', {
      draftAdjudication: {
        id: 34,
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
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.conditionalInputAssist().type('T3356FU')
    incidentRolePage.searchButtonAssist().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'assisted', '1'))
    })
  })
  it('should submit form successfully with correct data if the user changes their radio selection after searching', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.conditionalInputAssist().type('T3356FU')
    incidentRolePage.searchButtonAssist().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.radioButtons().find('input[value="incited"]').check()
    incidentRolePage.conditionalInputIncite().type('A5155DY')
    incidentRolePage.searchButtonIncite().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    cy.location().should(loc => {
      expect(loc.search).to.eq('?selectedPerson=A5155DY')
    })
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'incited', '1'))
    })
  })
  it('should use search button as default (for "enter" keypress) when changing radio from incited to assisted - just click radio, NOT input', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="incited"]').check()
    incidentRolePage.conditionalInputIncite().type('A5155DY{enter}')
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.radioButtons().find('input[value="assisted"]').check().type('{enter}')
    incidentRolePage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter a prisoner’s name or number')
      })
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.conditionalInputAssist().type('T3356FU{enter}')
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'assisted', '1'))
    })
  })
  it('should use search button as default (for "enter" keypress) when changing radio from incited to assisted - click radio and input', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="incited"]').check()
    incidentRolePage.conditionalInputIncite().type('A5155DY{enter}')
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.conditionalInputAssist().click().type('{enter}')
    incidentRolePage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter a prisoner’s name or number')
      })
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.conditionalInputAssist().type('T3356FU{enter}')
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'assisted', '1'))
    })
  })
  it('should use search button as default (for "enter" keypress) when changing radio from assisted to incited', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.conditionalInputAssist().type('T3356FU{enter}')
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.radioButtons().find('input[value="incited"]').check().type('{enter}')
    incidentRolePage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter a prisoner’s name or number')
      })
    incidentRolePage.conditionalInputIncite().click().type('T3356FU{enter}')
    cy.get('[data-qa="select-prisoner-link"]').click()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'incited', '1'))
    })
  })
  it('should show error summary if an associated prisoner is not entered', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="assisted"]').check()
    incidentRolePage.submitButton().click()
    incidentRolePage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter their name or prison number')
      })
  })
  it('should redirect the user to /offence-code-selection/ if form is incomplete', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="committed"]').check()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'committed', '1'))
    })
  })
  // EDIT tests moved over
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(134))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().should('exist')
    incidentRolePage.radioButtonLegend().should('exist')
    incidentRolePage.submitButton().should('exist')
    incidentRolePage.exitButton().should('exist')
  })
  it('should show the prisoners name in the radio button question', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(134))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtonLegend().should('contain.text', 'What was John Smith’s role in the incident?')
  })
  it('should submit form successfully if radio button changed from one which requires an associated prisoner PRN to one which does not', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(134))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="attempted"]').check()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(134, 'attempted', '1'))
    })
  })
  it('should submit form successfully if radio button changed from one which does not require an associated prisoner PRN to one which does', () => {
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
            roleCode: '25a',
          },
        },
      },
    })
    cy.visit(adjudicationUrls.incidentRole.urls.start(134))
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
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(134, 'incited', '1'))
    })
  })
  it('should error if the user has changed the radio button but not searched for the associated prisoner', () => {
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
          incidentRole: {},
        },
      },
    })
    cy.visit(adjudicationUrls.incidentRole.urls.start(134))
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
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(134, 'assisted', '1'))
    })
  })
  it('should remember once it comes back to this page after deleting an associated prisoner', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.start(134))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.inciteAssociatedPrisonerDeleteButton().click()
    cy.get('[data-qa="radio-buttons"]').find('input[value="yes"]').check()
    cy.get('[data-qa="delete-person-submit"]').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.start(134))
      expect(loc.search).to.eq('?personDeleted=true')
    })
    incidentRolePage.radioButtons().find('input[value="incited"]').should('be.checked')
    incidentRolePage.inciteAssociatedPrisonerDeleteButton().should('not.exist')
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
