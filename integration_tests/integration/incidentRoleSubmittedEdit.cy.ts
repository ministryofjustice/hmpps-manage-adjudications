import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import IncidentRole from '../pages/incidentRoleSubmittedEdit'
import Page from '../pages/page'

const testData = new TestData()

context('Incident role (edit after completion of report)', () => {
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
    cy.task('stubGetDraftAdjudication', {
      id: 34,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 34,
          adjudicationNumber: 1524455,
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
          adjudicationNumber: 1524455,
          prisonerNumber: 'G6415GD',
          incidentRole: {
            roleCode: '25a',
          },
        }),
      },
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: testData.residentialLocations(),
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
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.incidentRole.urls.submittedEdit(34))
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().should('exist')
    incidentRolePage.submitButton().should('exist')
  })

  it('should submit form successfully if all data entered and redirect to offence details page - reporter version', () => {
    cy.visit(
      `${adjudicationUrls.incidentRole.urls.submittedEdit(34)}?referrer=${adjudicationUrls.prisonerReport.urls.report(
        1524455
      )}`
    )
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(`${adjudicationUrls.incidentAssociate.urls.submittedEdit(34, 'incited')}`)
    })
  })
  it('should redirect to the prisoner report page if the user exits the page', () => {
    cy.visit(
      `${adjudicationUrls.incidentRole.urls.submittedEdit(34)}?referrer=${adjudicationUrls.prisonerReport.urls.report(
        1524455
      )}`
    )
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(1524455))
    })
  })
  context('Redirect on error', () => {
    beforeEach(() => {
      cy.task('stubUpdateDraftIncidentRole', { id: 34, response: {}, status: 500 })
    })
    it('should redirect back to incident details (edit) if an error occurs whilst calling the API', () => {
      cy.visit(
        `${adjudicationUrls.incidentRole.urls.submittedEdit(34)}?referrer=${adjudicationUrls.prisonerReport.urls.report(
          1524455
        )}`
      )
      const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
      incidentRolePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.not.eq(adjudicationUrls.prisonerReport.urls.report(1524455))
      })
      incidentRolePage.errorContinueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.submittedEdit(34))
      })
    })
  })
})
