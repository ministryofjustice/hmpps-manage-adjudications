import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PrisonerReport from '../pages/prisonerReport'
import ReviewerEditOffencesWarningPage from '../pages/reviewerEditOffencesWarning'
import AgeOfPrisonerPage from '../pages/ageofPrisonerSubmittedEdit'
import IncidentRoleEditPage from '../pages/incidentRoleSubmittedEdit'
import OffenceCodeSelectionListPage from '../pages/offenceCodeSelectionList'
import OffenceCodeSelection from '../pages/offenceCodeSelection'
import DetailsOfOffence from '../pages/detailsOfOffence'

const testData = new TestData()

const originalDraftTestOne = {
  draftAdjudication: testData.draftAdjudication({
    id: 177,
    chargeNumber: '12345',
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
}

const reportedAdjudicationTestOne = testData.reportedAdjudication({
  chargeNumber: '12345',
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
    victimOtherPersonsName: 'James Robertson',
  },
})

const offenceRules = [
  {
    paragraphNumber: '1(a)',
    paragraphDescription: 'Commits any racially aggravated assault',
  },
  {
    paragraphNumber: '12',
    paragraphDescription:
      'Has in his possession:<br><br>(a) any unauthorised article, or<br><br>(b) a greater quantity of any article than he is authorised to have',
  },
  {
    paragraphNumber: '3',
    paragraphDescription:
      'Denies access to any part of the prison to any officer or any person (other than a prisoner) who is at the prison for the purpose of working there',
  },
]

context('ALO edit test #1', () => {
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
      response: { reportedAdjudication: reportedAdjudicationTestOne },
    })

    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: '12345',
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 177,
          chargeNumber: '12345',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T13:10:00',
        }),
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 177,
      response: originalDraftTestOne,
    })
    cy.task('stubGetAllOffenceRules', { response: offenceRules })
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
        paragraphNumber: '1(a)',
        paragraphDescription: 'Commits any racially aggravated assault',
      },
    })
    cy.task('stubSaveYouthOffenderStatus', {
      id: '177',
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
      draftId: 177,
      response: reportedAdjudicationTestOne,
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })

    cy.signIn()
  })
  it('1001 -> 1021', () => {
    cy.visit(adjudicationUrls.prisonerReport.urls.review('12345'))
    const prisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    prisonerReportPage.offenceDetailsChangeLink().click()
    const warningPage: ReviewerEditOffencesWarningPage = Page.verifyOnPage(ReviewerEditOffencesWarningPage)
    warningPage.continueButton().click()
    const ageOfPrisonerPage: AgeOfPrisonerPage = Page.verifyOnPage(AgeOfPrisonerPage)
    ageOfPrisonerPage.submitButton().click()
    const incidentRolePage: IncidentRoleEditPage = Page.verifyOnPage(IncidentRoleEditPage)
    incidentRolePage.radioButtons().find('input[value="committed"]').check()
    incidentRolePage.submitButton().click()
    const offenceCodeSelectionListPage = new OffenceCodeSelectionListPage('Which offence did John Smith commit?')
    offenceCodeSelectionListPage.radio('1(a)').click()
    offenceCodeSelectionListPage.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio('98-4').check()
    whoWasAssaultedPage.prisonerOutsideEstablishmentNameInput().type('James Robertson')
    whoWasAssaultedPage.prisonerOutsideEstablishmentNumberInput().type('G7123CI')
    whoWasAssaultedPage.continue().click()
    const detailsOfOffencePage = new DetailsOfOffence()
    detailsOfOffencePage
      .questionAnswerSectionQuestion(1, 1)
      .contains('What type of offence did John Smith assist another prisoner to commit or attempt to commit?')
    detailsOfOffencePage
      .questionAnswerSectionAnswer(1, 1)
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 2).contains('What did the incident involve?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 2).contains('Assaulting someone')
    detailsOfOffencePage
      .questionAnswerSectionQuestion(1, 3)
      .contains('Who did John Smith assist James Jones to assault?')
    detailsOfOffencePage
      .questionAnswerSectionAnswer(1, 3)
      .contains("A prisoner who's left this establishment - James Robertson G7123CI")
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 4).contains('Was the incident a racially aggravated assault?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 4).contains('Yes')
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 1(a)')
    detailsOfOffencePage.offenceSection(1).contains('Commits any racially aggravated assault')
    detailsOfOffencePage.prisonRule().contains('Which set of rules apply to this prisoner?')
    detailsOfOffencePage.prisonRuleDesc().contains('Adult offences')
    detailsOfOffencePage.prisonRulePara().contains('Prison rule 51')
    detailsOfOffencePage.deleteLink(1).should('not.exist')
    detailsOfOffencePage.saveAndContinue().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review('12345'))
    })
  })
})
