import adjudicationUrls from '../../server/utils/urlGenerator'
import IncidentAssist from '../pages/incidentAssist'
import Page from '../pages/page'

context('Incident assist submitted edit', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
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
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: {
        offenderNo: 'T3356FU',
        firstName: 'Rishi',
        lastName: 'Rich',
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
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 27029,
          },
          incidentStatement: {},
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER2',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            associatedPrisonersName: null,
            roleCode: '25c',
          },
        },
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 35,
      response: {
        draftAdjudication: {
          id: 35,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 27029,
          },
          incidentStatement: {},
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER2',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            associatedPrisonersName: 'Boris Wrongun',
            roleCode: '25c',
          },
        },
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 34,
      response: {
        draftAdjudication: {
          id: 35,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 27029,
          },
          incidentStatement: {},
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER2',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            associatedPrisonersName: null,
            roleCode: '25c',
          },
        },
      },
    })
  })

  it('should contain the required page elements for internal prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssist.urls.submittedEdit(34))

    const incidentAssistPage: IncidentAssist = Page.verifyOnPage(IncidentAssist)
    incidentAssistPage.radioButtons().should('exist')
    incidentAssistPage.exitButton().should('exist')
    incidentAssistPage.submitButton().should('exist')

    incidentAssistPage.radioButtons().find('input[value="internal"]').should('be.checked')
    incidentAssistPage.radioButtons().find('input[value="external"]').should('not.be.checked')

    incidentAssistPage.internalNameInput().contains('Rich, Rishi')
    incidentAssistPage.internalNumberInput().contains('T3356FU')
  })

  it('should contain the required page elements for external prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssist.urls.submittedEdit(35))

    const incidentAssistPage: IncidentAssist = Page.verifyOnPage(IncidentAssist)
    incidentAssistPage.radioButtons().should('exist')
    incidentAssistPage.exitButton().should('exist')
    incidentAssistPage.submitButton().should('exist')

    incidentAssistPage.radioButtons().find('input[value="internal"]').should('not.be.checked')
    incidentAssistPage.radioButtons().find('input[value="external"]').should('be.checked')

    incidentAssistPage.externalNameInput().should('have.value', 'Boris Wrongun')
    incidentAssistPage.externalNumberInput().should('have.value', 'T3356FU')
  })

  it('should redirect the user to the task list page if they cancel', () => {
    cy.visit(adjudicationUrls.incidentAssist.urls.submittedEdit(35))

    const incidentAssistPage: IncidentAssist = Page.verifyOnPage(IncidentAssist)
    incidentAssistPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/35')
    })
  })

  it('should delete the internal prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssist.urls.submittedEdit(34))

    const incidentAssistPage: IncidentAssist = Page.verifyOnPage(IncidentAssist)
    incidentAssistPage.assistAssociatedPrisonerDeleteButton().click()
  })
})
