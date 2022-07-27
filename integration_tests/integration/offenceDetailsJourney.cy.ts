import { DraftAdjudication } from '../../server/data/DraftAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AgeOfPrisoner from '../pages/ageofPrisoner'
import IncidentRole from '../pages/incidentRole'
import Page from '../pages/page'

const draftAdjudicationForCommittedYouthOffences: DraftAdjudication = {
  id: 3456,
  prisonerNumber: 'G6415GD',
  incidentDetails: {
    dateTimeOfIncident: '2021-11-03T11:09:00',
    handoverDeadline: '2021-11-05T11:09:00',
    locationId: 234,
  },
  isYouthOffender: true,
  incidentRole: {
    roleCode: null,
  },
  offenceDetails: [
    {
      offenceCode: 1001,
      offenceRule: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
      victimPrisonersNumber: 'G5512G',
    },
  ],
  startedByUserId: 'TEST_GEN',
}

context('Existing draft adjudication', () => {
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
        dateOfBirth: '1990-10-11',
      },
    })
    cy.task('stubSaveYouthOffenderStatus', {
      adjudicationNumber: '3456',
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
    const AgeOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    AgeOfPrisonerPage.radioAdult().click()
    AgeOfPrisonerPage.submitButton().click()
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="committed"]').check()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.detailsOfOffence.urls.start(3456))
    })
  })

  it('should go to the offence selection page via the role and rule page - url for resetting offences', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.startWithResettingOffences(3456))
    const AgeOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    AgeOfPrisonerPage.radioAdult().click()
    AgeOfPrisonerPage.submitButton().click()
    const incidentRolePage: IncidentRole = Page.verifyOnPage(IncidentRole)
    incidentRolePage.radioButtons().find('input[value="committed"]').check()
    incidentRolePage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(3456, 'committed', '1'))
    })
  })
})
