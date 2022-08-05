import adjudicationUrls from '../../server/utils/urlGenerator'
import IncidentAssist from '../pages/incidentAssist'
import Page from '../pages/page'

context('Incident assist', () => {
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
        },
      },
    })
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.incidentAssist.urls.start(34))

    const incidentAssistPage: IncidentAssist = Page.verifyOnPage(IncidentAssist)
    incidentAssistPage.radioButtons().should('exist')
    incidentAssistPage.exitButton().should('exist')
    incidentAssistPage.submitButton().should('exist')

    incidentAssistPage.radioButtons().find('input[value="internal"]').should('not.be.checked')
    incidentAssistPage.radioButtons().find('input[value="external"]').should('not.be.checked')
  })

  it('should redirect the user to the task list page if they cancel', () => {
    cy.visit(adjudicationUrls.incidentAssist.urls.start(34))

    const incidentAssistPage: IncidentAssist = Page.verifyOnPage(IncidentAssist)
    incidentAssistPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/34')
    })
  })

  it('should submit form successfully if all data entered - associated prisoner required - internal prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssist.urls.start(34))

    const incidentAssistPage: IncidentAssist = Page.verifyOnPage(IncidentAssist)
    incidentAssistPage.radioButtons().find('input[value="internal"]').check()
    incidentAssistPage.conditionalInputInternalAssist().type('T3356FU')
    incidentAssistPage.searchButton().click()
    // cy.get('[data-qa="select-prisoner-link"]').click()
    // incidentAssistPage.submitButton().click()
    // cy.location().should(loc => {
    //  expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'assisted', '1'))
    // })
  })
})
