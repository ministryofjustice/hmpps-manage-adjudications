import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import TestData from '../../server/routes/testutils/testData'
import CheckCreateOnBehalfOfPage from '../pages/checkCreateOnBehalfOf'
import CreateOnBehalfOfPage from '../pages/createOnBehalfOf'
import CreateOnBehalfOfReasonPage from '../pages/createOnBehalfOfReason'
import CheckYourAnswers from '../pages/checkYourAnswers'

const testData = new TestData()
const createdOnBehalfOfOfficer = 'some officer'
const createdOnBehalfOfReason = 'some reason'

context('Create on behalf of', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        gender: 'Unknown',
      }),
    })
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'James',
        lastName: 'Jones',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'Paul',
        lastName: 'Wright',
      }),
    })

    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
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
    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 3456,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T11:09:42',
          dateTimeOfDiscovery: '2021-11-06T11:09:42',
          locationId: 25538,
          incidentStatement: {
            statement: 'This is my statement',
            completed: true,
          },
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25c',
            offenceRule: {
              paragraphNumber: '25(c)',
              paragraphDescription:
                'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
            },
          },
          offenceDetails: {
            offenceCode: 1001,
            offenceRule: {
              paragraphNumber: '1',
              paragraphDescription: 'Commits any assault',
            },
            victimPrisonersNumber: 'G5512G',
          },
        }),
      },
    })
    cy.task('stubSubmitCompleteDraftAdjudication', {
      id: 3456,
      response: testData.reportedAdjudication({
        chargeNumber: '234',
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2021-11-07T11:09:42',
      }),
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
      cy.visit(adjudicationUrls.checkYourAnswers.urls.start(3456))
      const checkYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
      checkYourAnswersPage.reportingOfficerChangeLink().click()
      const createOnBehalfOfPage: CreateOnBehalfOfPage = Page.verifyOnPage(CreateOnBehalfOfPage)
      createOnBehalfOfPage.cancelLink().should('exist')
      createOnBehalfOfPage.officersName().type(createdOnBehalfOfOfficer)
      createOnBehalfOfPage.submitButton().click()

      const createOnBehalfOfReasonPage = new CreateOnBehalfOfReasonPage(createdOnBehalfOfOfficer)
      createOnBehalfOfReasonPage.cancelLink().should('exist')
      createOnBehalfOfReasonPage.behalfOfReason().type(createdOnBehalfOfReason)
      createOnBehalfOfReasonPage.submitButton().click()

      const checkCreateOnBehalfOfPage: CheckCreateOnBehalfOfPage = Page.verifyOnPage(CheckCreateOnBehalfOfPage)
      checkCreateOnBehalfOfPage.reportingOfficerChangeLink().should('exist')
      checkCreateOnBehalfOfPage.reasonChangeLink().should('exist')
      checkCreateOnBehalfOfPage.cancelLink().should('exist')
      cy.get('[data-qa="behalf-of-summary-table"]').contains(createdOnBehalfOfOfficer)
      cy.get('[data-qa="behalf-of-summary-table"]').contains(createdOnBehalfOfReason)
      checkCreateOnBehalfOfPage.submitButton().click()
      Page.verifyOnPage(CheckYourAnswers)
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
      checkCreateOnBehalfOfPage.reportingOfficerChangeLink().click()

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
})
