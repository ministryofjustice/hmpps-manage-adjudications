import OffenceCodeSelection from '../pages/offenceCodeSelection'
import Page from '../pages/page'
import DetailsOfOffence from '../pages/detailsOfOffence'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PrisonerReport from '../pages/prisonerReport'
import ReviewerEditOffencesWarningPage from '../pages/reviewerEditOffencesWarning'
import AgeOfPrisonerPage from '../pages/ageofPrisonerSubmittedEdit'
import IncidentRoleEditPage from '../pages/incidentRoleSubmittedEdit'
import OffenceCodeSelectionListPage from '../pages/offenceCodeSelectionList'

const testData = new TestData()

const originalDraftTestOne = {
  draftAdjudication: testData.draftAdjudication({
    id: 177,
    chargeNumber: '12345',
    prisonerNumber: 'G6415GD',
    dateTimeOfIncident: '2021-11-03T13:10:00',
    locationId: 25538,
    incidentRole: {
      roleCode: null,
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
  },
})

const yoiOriginalDraftTestOne = {
  draftAdjudication: testData.draftAdjudication({
    id: 1777,
    isYouthOffender: true,
    chargeNumber: '123456',
    prisonerNumber: 'G6415GD',
    dateTimeOfIncident: '2021-11-03T13:10:00',
    locationId: 25538,
    incidentRole: {
      roleCode: null,
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
    },
  }),
}

const yoiReportedAdjudicationTestOne = testData.reportedAdjudication({
  chargeNumber: '123456',
  prisonerNumber: 'G6415GD',
  isYouthOffender: true,
  dateTimeOfIncident: '2021-11-03T13:10:00',
  locationId: 25538,
  incidentRole: {},
  offenceDetails: {
    offenceCode: 1021,
    offenceRule: {
      paragraphNumber: '1(a)',
      paragraphDescription: 'Commits any racially aggravated assault',
    },
  },
})

const offenceRules = [
  {
    paragraphNumber: '23(a)',
    paragraphDescription: 'Failure to comply with any payback punishment',
  },
  {
    paragraphNumber: '26(a)',
    paragraphDescription: 'Failure to comply with any payback punishment',
  },
  {
    paragraphNumber: '23',
    paragraphDescription:
      'Uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic',
  },
  {
    paragraphNumber: '20(a)',
    paragraphDescription:
      'Uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic',
  },
]

context.skip('v2 offences', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    // Committed draft
    cy.task('stubGetDraftAdjudication', {
      id: 100,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 100,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T13:10:00',
        }),
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
    // Offence rules
    cy.task('stubGetOffenceRule', {
      offenceCode: 2600124,
      response: {
        paragraphNumber: '23(a)',
        paragraphDescription: 'Failure to comply with any payback punishment',
      },
    })
  })
  it('failure to comply with payback offence 23(a)', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-6').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-6-3').check()
    whatTypeOfOffencePage.continue().click()

    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

    detailsOfOffencePage
      .offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(2).innerText).to.contain('Failure to comply with any payback punishment')
      })
  })

  it('threatening, abusive or insulting behaviour 20(a)', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-5').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-5-2').check()
    whatTypeOfOffencePage.continue().click()
    // now add the new path
    const aggravateByProtectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    aggravateByProtectedCharacteristic.radio('1-5-2-1').check()
    whatTypeOfOffencePage.continue().click()
    // now this should lead to the new page
    const whichProtectedCharacteristic = new OffenceCodeSelection(
      'Select which protected characteristics were part of the reason for the incident'
    )
    whichProtectedCharacteristic.checkbox('1-5-2-1-1').check()
    whichProtectedCharacteristic.checkbox('1-5-2-1-2').check()
    whichProtectedCharacteristic.continueCheckboxes().click()

    /* const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

    detailsOfOffencePage
      .offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(2).innerText).to.contain('Failure to comply with any payback punishment')
      }) */
  })
})

context.skip('v2 offences ALO', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
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
    cy.task('stubGetReportedAdjudication', {
      id: 12345,
      response: { reportedAdjudication: reportedAdjudicationTestOne },
    })

    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: '12345',
      response: originalDraftTestOne,
    })
    cy.task('stubGetDraftAdjudication', {
      id: 177,
      response: originalDraftTestOne,
    })

    cy.task('stubGetReportedAdjudication', {
      id: 123456,
      response: { reportedAdjudication: yoiReportedAdjudicationTestOne },
    })

    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: '123456',
      response: yoiOriginalDraftTestOne,
    })
    cy.task('stubGetDraftAdjudication', {
      id: 1777,
      response: yoiOriginalDraftTestOne,
    })
    cy.task('stubGetAllOffenceRules', { version: 2, response: offenceRules })
    cy.task('stubGetAllOffenceRules', { isYouthOffender: true, version: 2, response: offenceRules })

    cy.task('stubSaveYouthOffenderStatus', {
      id: '177',
      response: {},
    })
    cy.task('stubSaveYouthOffenderStatus', {
      id: '1777',
      response: {},
    })
    cy.task('stubUpdateDraftIncidentRole', {
      id: 177,
      response: {},
    })
    cy.task('stubUpdateDraftIncidentRole', {
      id: 1777,
      response: {},
    })
    cy.task('stubAloAmendOffenceDetails', {
      draftId: 177,
      response: reportedAdjudicationTestOne,
    })
    cy.task('stubAloAmendOffenceDetails', {
      draftId: 1777,
      response: yoiReportedAdjudicationTestOne,
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.signIn()
  })
  ;[
    {
      testName: '2600124 > 23(a) ',
      radio: '23(a)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '2600124',
      isYouthOffender: false,
      chargeNumber: '12345',
      additionalQuestion: false,
    },
    {
      testName: '2600124 > 26(a) ',
      radio: '26(a)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '2600124',
      isYouthOffender: true,
      chargeNumber: '123456',
      additionalQuestion: false,
    },
    {
      testName: '2600124 > 20(a) ',
      radio: '20(a)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '2000124',
      isYouthOffender: false,
      chargeNumber: '12345',
      additionalQuestion: true,
      key: '1-5-2-1',
    },
    {
      testName: '2600124 > 23 ',
      radio: '23',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '2000124',
      isYouthOffender: true,
      chargeNumber: '123456',
      additionalQuestion: true,
      key: '1-5-2-1',
    },
  ].forEach(test => {
    it(test.testName, () => {
      if (test.isYouthOffender) {
        cy.task('stubGetOffenceRule', {
          offenceCode: 2600124,
          response: {
            paragraphNumber: '26(a)',
            paragraphDescription: 'Failure to comply with any payback punishment',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 2000124,
          response: {
            paragraphNumber: '23',
            paragraphDescription:
              'Uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic',
          },
        })
      } else {
        cy.task('stubGetOffenceRule', {
          offenceCode: 2600124,
          response: {
            paragraphNumber: '23(a)',
            paragraphDescription: 'Failure to comply with any payback punishment',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 2000124,
          response: {
            paragraphNumber: '20(a)',
            paragraphDescription:
              'Uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic',
          },
        })
      }

      cy.visit(adjudicationUrls.prisonerReport.urls.review(test.chargeNumber))
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
      if (!test.additionalQuestion) {
        cy.location().should(loc => {
          expect(loc.search).to.contain(`offenceCode=${test.offenceCode}`)
        })
      } else {
        cy.location().should(loc => {
          expect(loc.pathname).to.contain(`/${test.key}`)
        })
        const whichProtectedCharacteristic = new OffenceCodeSelection(
          'Select which protected characteristics were part of the reason for the incident'
        )
        whichProtectedCharacteristic.checkbox('1-5-2-1-1').check()
        whichProtectedCharacteristic.continueCheckboxes().click()

        //  const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
      }
    })
  })
})
