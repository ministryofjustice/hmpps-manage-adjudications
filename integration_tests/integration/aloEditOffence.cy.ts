import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PrisonerReport from '../pages/prisonerReport'
import ReviewerEditOffencesWarningPage from '../pages/reviewerEditOffencesWarning'
import AgeOfPrisonerPage from '../pages/ageofPrisonerSubmittedEdit'
import IncidentRoleEditPage from '../pages/incidentRoleSubmittedEdit'
import OffenceCodeSelectionListPage from '../pages/offenceCodeSelectionList'
import OffenceCodeSelection from '../pages/offenceCodeSelection'

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
    paragraphNumber: '10',
    paragraphDescription:
      'Is intoxicated as a consequence of consuming any alcoholic beverage (but subject to rule 52A)',
  },
  {
    paragraphNumber: '19',
    paragraphDescription:
      'Is disrespectful to any officer, or any person (other than a prisoner) who is at the prison for the purpose of working there, or any person visiting a prison',
  },
]

context('Adult', () => {
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
      offenceCode: 1021,
      response: {
        paragraphNumber: '1(a)',
        paragraphDescription: 'Commits any racially aggravated assault',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 19003,
      response: {
        paragraphNumber: '19',
        paragraphDescription:
          'Is disrespectful to any officer, or any person (other than a prisoner) who is at the prison for the purpose of working there, or any person visiting a prison',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 10001,
      response: {
        paragraphNumber: '10',
        paragraphDescription:
          'Is intoxicated as a consequence of consuming any alcoholic beverage (but subject to rule 52A)',
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
  ;[
    {
      testName: '1001 -> 1021 / 1 -> 1(a) / Extra questions with decision tree',
      radio: '1(a)',
      radio2: '98-4',
      title: 'Who was assaulted?',
      victimName: 'James Robertson',
      victimPN: 'G7123CI',
      offenceCode: '1021',
    },
    {
      testName: '1001 -> 19003 / 1 -> 19 / Extra questions',
      radio: '19',
      radio2: '1-5-1-3',
      title: 'Who was John Smith disrespectful to?',
      victimName: 'James Robertson',
      victimPN: null,
      offenceCode: '19003',
    },
    {
      testName: '1001 -> 10001 / 1 -> 10 / Direct answer',
      radio: '10',
      radio2: null,
      title: null,
      victimName: null,
      victimPN: null,
      offenceCode: '10001',
    },
  ].forEach(test => {
    it(test.testName, () => {
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
      offenceCodeSelectionListPage.radio(test.radio).click()
      offenceCodeSelectionListPage.continue().click()
      if (test.radio2) {
        const questionPage = new OffenceCodeSelection(test.title)
        questionPage.radio(test.radio2).check()
        if (test.radio === '1(a)') {
          questionPage.prisonerOutsideEstablishmentNameInput().type('James Robertson')
          questionPage.prisonerOutsideEstablishmentNumberInput().type('G7123CI')
        }
        if (test.radio === '19') {
          questionPage.radio('1-5-1-3').check()
          questionPage.victimOtherPersonSearchNameInput().type('Tony Robinson')
        }
        questionPage.continue().click()
      }
      cy.location().should(loc => {
        expect(loc.search).to.contain(`offenceCode=${test.offenceCode}`)
      })
    })
  })
})
