import IncidentRole from '../pages/incidentRole'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

const draftAdjNoRole = testData.draftAdjudication({
  id: 34,
  prisonerNumber: 'G6415GD',
})
delete draftAdjNoRole.incidentRole

context('Incident role', () => {
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
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
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
    cy.task('stubGetDraftAdjudication', {
      id: 34,
      response: {
        draftAdjudication: draftAdjNoRole,
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 134,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 134,
          prisonerNumber: 'G6415GD',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25b',
          },
        }),
      },
    })
    cy.task('stubUpdateDraftIncidentRole', {
      id: 34,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 34,
          prisonerNumber: 'G6415GD',
          incidentRole: {
            roleCode: '25a',
          },
        }),
      },
    })
    cy.task('stubUpdateDraftIncidentRole', {
      id: 134,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 134,
          prisonerNumber: 'G6415GD',
          incidentRole: {
            roleCode: '25a',
          },
        }),
      },
    })
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'T3356FU',
        prisonIds: ['MDI'],
      },
      results: [
        testData.prisonerSearchSummary({
          firstName: 'JAMES',
          lastName: 'JONES',
          prisonerNumber: 'T3356FU',
          enhanced: false,
        }),
      ],
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
          enhanced: false,
        }),
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
