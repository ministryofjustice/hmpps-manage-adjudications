import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import TestData from '../../server/routes/testutils/testData'
import CheckCreateOnBehalfOfPage from '../pages/checkCreateOnBehalfOf'

const testData = new TestData()

context('Check create on behalf of', () => {
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
      id: 3456,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 3456,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T11:09:00',
        }),
      },
    })
    cy.task('stubEditDraftIncidentDetails', {
      id: 3456,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 3456,
          dateTimeOfIncident: '2021-11-03T11:09:42',
          locationId: 25538,
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
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'T3356FU',
        prisonIds: ['MDI'],
      },
      results: [testData.prisonerSearchSummary({ firstName: 'JAMES', lastName: 'JONES', prisonerNumber: 'T3356FU' })],
    })
    cy.task('stubSetCreatedOnBehalfOf', {
      draftId: 3456,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 3456,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T11:09:00',
          createdOnBehalfOfOfficer: 'officer',
          createdOnBehalfOfReason: 'some reason',
        }),
      },
    })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.createOnBehalfOf.url.check(3456))
    const checkCreateOnBehalfOfPage: CheckCreateOnBehalfOfPage = Page.verifyOnPage(CheckCreateOnBehalfOfPage)
    checkCreateOnBehalfOfPage.submitButton().should('exist')
    checkCreateOnBehalfOfPage.cancelLink().should('exist')
  })

  it('should redirect to the incident details page when the form is submitted', () => {
    cy.visit(adjudicationUrls.createOnBehalfOf.url.check(3456))
    const checkCreateOnBehalfOfPage: CheckCreateOnBehalfOfPage = Page.verifyOnPage(CheckCreateOnBehalfOfPage)
    checkCreateOnBehalfOfPage.submitButton().click()
  })
})
