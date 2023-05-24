import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PrisonerReport from '../pages/prisonerReport'
import ReviewerEditOffencesWarningPage from '../pages/reviewerEditOffencesWarning'
import AgeOfPrisonerPage from '../pages/ageofPrisonerSubmittedEdit'
import IncidentRoleEditPage from '../pages/incidentRoleSubmittedEdit'
import DetailsOfOffence from '../pages/detailsOfOffence'

import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import OffenceCodeSelection from '../pages/offenceCodeSelection'

const testData = new TestData()

const reportedAdjudication = (status: ReportedAdjudicationStatus) => {
  return testData.reportedAdjudication({
    adjudicationNumber: 1524493,
    prisonerNumber: 'G6415GD',
    dateTimeOfIncident: '2021-12-09T10:30:00',
    status,
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
  })
}

const editedDraftAdjudication = {
  draftAdjudication: testData.draftAdjudication({
    id: 177,
    adjudicationNumber: 12345,
    prisonerNumber: 'G6415GD',
    dateTimeOfIncident: '2021-11-03T13:10:00',
    locationId: 25538,
    incidentRole: {},
  }),
}

const editedReportedAdjudication = testData.reportedAdjudication({
  adjudicationNumber: 12345,
  prisonerNumber: 'G6415GD',
  dateTimeOfIncident: '2021-11-03T13:10:00',
  locationId: 25538,
  incidentRole: {},
  offenceDetails: {
    offenceCode: 1021,
    offenceRule: {
      paragraphNumber: '1(a)',
      paragraphDescription: 'Commits any racially aggravated assault',
    },
    victimPrisonersNumber: 'G7123CI',
    victimOtherPersonsName: ' James Robertson',
  },
})

context('ALO edits offence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetLocation', {
      locationId: 25538,
      response: {
        locationId: 25538,
        agencyId: 'MDI',
        locationPrefix: 'MDI-1',
        userDescription: 'Houseblock 1',
      },
    })
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    // Associated Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: {
        reportedAdjudication: reportedAdjudication(ReportedAdjudicationStatus.AWAITING_REVIEW),
      },
    })

    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 12345,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 177,
          adjudicationNumber: 12345,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T13:10:00',
        }),
      },
    })

    cy.task('stubGetDraftAdjudication', {
      id: 177,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 177,
          adjudicationNumber: 12345,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T13:10:00',
          locationId: 25538,
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
    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 1021,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubSaveYouthOffenderStatus', {
      adjudicationNumber: '177',
      response: testData.draftAdjudication({
        id: 177,
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2021-11-03T11:09:00',
      }),
    })
    cy.task('stubUpdateDraftIncidentRole', {
      id: 177,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 177,
          prisonerNumber: 'G6415GD',
          incidentRole: {
            roleCode: '25a',
          },
        }),
      },
    })
    cy.task('stubSearchPrisonerDetails', {
      prisonerNumber: 'G7123CI',
    })
    cy.task('stubAloAmendOffenceDetails', {
      adjudicationNumber: 177,
      response: editedReportedAdjudication,
    })
    cy.signIn()
  })
  it('allows ALO to update the adjudication offence', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review(12345))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.offenceDetailsChangeLink().click()
    const warningPage: ReviewerEditOffencesWarningPage = Page.verifyOnPage(ReviewerEditOffencesWarningPage)
    warningPage.continueButton().click()
    const ageOfPrisonerPage: AgeOfPrisonerPage = Page.verifyOnPage(AgeOfPrisonerPage)
    ageOfPrisonerPage.submitButton().click()
    const incidentRolePage: IncidentRoleEditPage = Page.verifyOnPage(IncidentRoleEditPage)
    incidentRolePage.radioButtons().find('input[value="committed"]').check()
    incidentRolePage.submitButton().click()
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve?')
    whatDidTheIncidentInvolve.radio('1-1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio('1-1-1-4').check()
    whoWasAssaultedPage.prisonerOutsideEstablishmentNameInput().type('James Robertson')
    whoWasAssaultedPage.prisonerOutsideEstablishmentNumberInput().type('G7123CI')
    whoWasAssaultedPage.continue().click()
    const raciallyAggravated = new OffenceCodeSelection('Was the incident a racially aggravated assault?')
    raciallyAggravated.radio('1-1-1-4-1').click()
    cy.task('stubGetDraftAdjudication', {
      id: 177,
      response: editedDraftAdjudication,
    })
    whoWasAssaultedPage.continue().click()
    const detailsOfOffencePage = new DetailsOfOffence()
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 1).contains('What type of offence did John Smith commit?')
    detailsOfOffencePage
      .questionAnswerSectionAnswer(1, 1)
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 2).contains('What did the incident involve?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 2).contains('Assaulting someone')
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 3).contains('Who was assaulted?')
    detailsOfOffencePage
      .questionAnswerSectionAnswer(1, 3)
      .contains("A prisoner who's left this establishment - James Robertson G7123CI")
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 4).contains('Was the incident a racially aggravated assault?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 4).contains('Yes')
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 1')
    detailsOfOffencePage.offenceSection(1).contains('Commits any assault')
    detailsOfOffencePage.prisonRule().contains('Which set of rules apply to this prisoner?')
    detailsOfOffencePage.prisonRuleDesc().contains('Adult offences')
    detailsOfOffencePage.prisonRulePara().contains('Prison rule 51')
    detailsOfOffencePage.saveAndContinue().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(12345))
    })
  })
})
