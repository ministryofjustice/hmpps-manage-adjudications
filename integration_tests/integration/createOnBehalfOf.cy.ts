import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import TestData from '../../server/routes/testutils/testData'
import CheckCreateOnBehalfOfPage from '../pages/checkCreateOnBehalfOf'
import CreateOnBehalfOfPage from '../pages/createOnBehalfOf'
import CreateOnBehalfOfReasonPage from '../pages/createOnBehalfOfReason'
import IncidentDetailsPage from '../pages/incidentDetails'

const testData = new TestData()
const createdOnBehalfOfOfficer = 'some officer'
const createdOnBehalfOfReason = 'some reason'

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

context('Happy path', () => {
  it('user should be able to create on behalf of', () => {
    cy.visit(adjudicationUrls.createOnBehalfOf.urls.start(3456))
    const createOnBehalfOfPage: CreateOnBehalfOfPage = Page.verifyOnPage(CreateOnBehalfOfPage)
    createOnBehalfOfPage.cancelLink().should('exist')
    createOnBehalfOfPage.officersName().type(createdOnBehalfOfOfficer)
    createOnBehalfOfPage.submitButton().click()

    const createOnBehalfOfReasonPage = new CreateOnBehalfOfReasonPage(createdOnBehalfOfOfficer)
    createOnBehalfOfReasonPage.cancelLink().should('exist')
    createOnBehalfOfReasonPage.behalfOfReason().type(createdOnBehalfOfReason)
    createOnBehalfOfReasonPage.submitButton().click()

    const checkCreateOnBehalfOfPage: CheckCreateOnBehalfOfPage = Page.verifyOnPage(CheckCreateOnBehalfOfPage)
    checkCreateOnBehalfOfPage.changeLink().should('have.length', 2)
    checkCreateOnBehalfOfPage.cancelLink().should('exist')
    cy.get('[data-qa="behalf-of-summary-table"]').contains(createdOnBehalfOfOfficer)
    cy.get('[data-qa="behalf-of-summary-table"]').contains(createdOnBehalfOfReason)
    checkCreateOnBehalfOfPage.submitButton().click()
    Page.verifyOnPage(IncidentDetailsPage)
  })
  it('user should be able to change their answers', () => {
    cy.visit(adjudicationUrls.createOnBehalfOf.urls.start(3456))
    const createOnBehalfOfPage: CreateOnBehalfOfPage = Page.verifyOnPage(CreateOnBehalfOfPage)
    createOnBehalfOfPage.officersName().type(createdOnBehalfOfOfficer)
    createOnBehalfOfPage.submitButton().click()

    const createOnBehalfOfReasonPage = new CreateOnBehalfOfReasonPage(createdOnBehalfOfOfficer)
    createOnBehalfOfReasonPage.behalfOfReason().type(createdOnBehalfOfReason)
    createOnBehalfOfReasonPage.submitButton().click()

    const checkCreateOnBehalfOfPage: CheckCreateOnBehalfOfPage = Page.verifyOnPage(CheckCreateOnBehalfOfPage)
    checkCreateOnBehalfOfPage.changeLink().first().click()

    const updatedCreatedOnBehalfOfOfficer = 'updated officer name'
    Page.verifyOnPage(CreateOnBehalfOfPage)
    createOnBehalfOfPage.officersName().clear()
    createOnBehalfOfPage.officersName().type(updatedCreatedOnBehalfOfOfficer)
    createOnBehalfOfPage.submitButton().click()

    const updatedCreatedOnBehalfOfReason = 'updated reason'
    const updatedCreateOnBehalfOfReasonPage = new CreateOnBehalfOfReasonPage(updatedCreatedOnBehalfOfOfficer)
    updatedCreateOnBehalfOfReasonPage.behalfOfReason().clear()
    updatedCreateOnBehalfOfReasonPage.behalfOfReason().type(updatedCreatedOnBehalfOfReason)
    updatedCreateOnBehalfOfReasonPage.submitButton().click()

    cy.get('[data-qa="behalf-of-summary-table"]').contains(updatedCreatedOnBehalfOfReason)
    cy.get('[data-qa="behalf-of-summary-table"]').contains(updatedCreatedOnBehalfOfOfficer)
    checkCreateOnBehalfOfPage.submitButton().click()
    Page.verifyOnPage(IncidentDetailsPage)
  })
})

describe('Validation', () => {
  it('input should be validated', () => {
    cy.visit(adjudicationUrls.createOnBehalfOf.urls.start(3456))
    const createOnBehalfOfPage: CreateOnBehalfOfPage = Page.verifyOnPage(CreateOnBehalfOfPage)
    createOnBehalfOfPage.submitButton().click()
    createOnBehalfOfPage.errorSummary().should('exist')
    createOnBehalfOfPage.officersName().type(createdOnBehalfOfOfficer)
    createOnBehalfOfPage.submitButton().click()

    const createOnBehalfOfReasonPage = new CreateOnBehalfOfReasonPage(createdOnBehalfOfOfficer)
    createOnBehalfOfReasonPage.submitButton().click()
    createOnBehalfOfReasonPage.errorSummary().should('exist')
    createOnBehalfOfReasonPage.behalfOfReason().type(createdOnBehalfOfReason)
    createOnBehalfOfReasonPage.submitButton().click()

    Page.verifyOnPage(CheckCreateOnBehalfOfPage)
  })
})
