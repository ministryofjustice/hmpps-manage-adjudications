import { DraftAdjudication } from '../../server/data/DraftAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AgeOfPrisoner from '../pages/ageofPrisoner'
import IncidentRole from '../pages/incidentRole'
import Page from '../pages/page'

const testData = new TestData()

const draftAdjudicationForCommittedYouthOffences: DraftAdjudication = testData.draftAdjudication({
  id: 3456,
  prisonerNumber: 'G6415GD',
  dateTimeOfIncident: '2021-11-03T11:09:00',
  offenceDetails: {
    offenceCode: 1001,
    offenceRule: {
      paragraphNumber: '1',
      paragraphDescription: 'Commits any assault',
    },
    victimPrisonersNumber: 'G5512G',
  },
})

context('Existing draft adjudication', () => {
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
    cy.task('stubSaveYouthOffenderStatus', {
      id: 3456,
      response: {
        draftAdjudication: draftAdjudicationForCommittedYouthOffences,
      },
    })
    cy.task('stubUpdateDraftIncidentRole', {
      id: 3456,
      response: {
        draftAdjudication: draftAdjudicationForCommittedYouthOffences,
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      response: {
        draftAdjudication: draftAdjudicationForCommittedYouthOffences,
      },
    })
    cy.signIn()
  })

  it('should go to the offence details page via the role and rule page - standard url', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.radioAdult().click({ force: true })
    ageOfPrisonerPage.submitButton().click()
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="committed"]').check({ force: true })
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfOffence.urls.start(3456))
    })
  })

  it('should go to the offence selection page via the role and rule page - url for resetting offences', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.startWithResettingOffences(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.radioAdult().click({ force: true })
    ageOfPrisonerPage.submitButton().click()
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="committed"]').check({ force: true })
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(3456, 'committed', '1'))
    })
  })
})
