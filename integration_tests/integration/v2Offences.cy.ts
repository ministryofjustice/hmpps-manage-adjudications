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
import { ProtectedCharacteristicsTypes } from '../../server/routes/offenceCodeDecisions/offenceData'

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
    offenceCode: 1022,
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
    offenceCode: 1022,
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
  {
    paragraphNumber: '19',
    paragraphDescription:
      'causes damage to, or destruction of, any part of a young offender institution or any other property, other than his own, aggravated by a protected characteristic',
  },
  {
    paragraphNumber: '17(a)',
    paragraphDescription:
      'causes damage to, or destruction of, any part of a prison or any other property, other than his own, aggravated by a protected characteristic',
  },
  {
    paragraphNumber: '24(a)',
    paragraphDescription:
      'displays, attaches or draws on any part of a young offender institution, or on any other property,  threatening, abusive or insulting words, drawings, symbols or other material, which  demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them  sharing a protected characteristic',
  },
  {
    paragraphNumber: '28',
    paragraphDescription:
      'displays, attaches or draws on any part of a young offender institution, or on any other property,  threatening, abusive or insulting words, drawings, symbols or other material, which  demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them  sharing a protected characteristic',
  },
  {
    paragraphNumber: '1(b)',
    paragraphDescription: 'commits any sexual assault',
  },
  {
    paragraphNumber: '2(a)',
    paragraphDescription: 'commits any sexual assault',
  },
  {
    paragraphNumber: '1(c)',
    paragraphDescription: 'exposes himself, or commits any other indecent or obscene act',
  },
  {
    paragraphNumber: '2(b)',
    paragraphDescription: 'exposes himself, or commits any other indecent or obscene act',
  },
  {
    paragraphNumber: '1(d)',
    paragraphDescription: 'sexually harasses any person',
  },
  {
    paragraphNumber: '2(c)',
    paragraphDescription: 'sexually harasses any person',
  },
  {
    paragraphNumber: '2',
    paragraphDescription: 'commits any assault aggravated by a protected characteristic',
  },
  {
    paragraphNumber: '1(a)',
    paragraphDescription: 'commits any assault aggravated by a protected characteristic',
  },
]

context('v2 offences', () => {
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
    cy.task('stubGetDraftAdjudication', {
      id: 101,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 101,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T13:10:00',
          offenceDetails: {
            offenceCode: 2410124,
            protectedCharacteristics: [ProtectedCharacteristicsTypes.DISABILITY],
          },
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
    cy.task('stubGetOffenceRule', {
      offenceCode: 102224,
      response: {
        paragraphNumber: '1(b)',
        paragraphDescription: 'commits any sexual assault',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 102324,
      response: {
        paragraphNumber: '1(c)',
        paragraphDescription: 'exposes himself, or commits any other indecent or obscene act',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 102424,
      response: {
        paragraphNumber: '1(d)',
        paragraphDescription: 'sexually harasses any person',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 2000124,
      response: {
        paragraphNumber: '20(a)',
        paragraphDescription:
          'uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 1700124,
      response: {
        paragraphNumber: '17(a)',
        paragraphDescription:
          'causes damage to, or destruction of, any part of a prison or any other property, other than his own, aggravated by a protected characteristic',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 2410124,
      response: {
        paragraphNumber: '24(a)',
        paragraphDescription:
          'uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic',
      },
    })
    cy.task('stubSaveOffenceDetails', {
      draftId: 100,
      response: {},
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

    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

    detailsOfOffencePage
      .offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(5).innerText).to.contain(
          'uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic'
        )
      })
  })
  it('causes damage to, or destruction of, any part of a prison or any other property, other than his own, aggravated by a protected characteristic 17(a)', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-4').check()
    whatTypeOfOffencePage.continue().click()

    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-4-2').check()
    whatTypeOfOffencePage.continue().click()

    // now add the new path
    const aggravateByProtectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    aggravateByProtectedCharacteristic.radio('1-4-2-1').check()
    whatTypeOfOffencePage.continue().click()
    // now this should lead to the new page
    const whichProtectedCharacteristic = new OffenceCodeSelection(
      'Select which protected characteristics were part of the reason for the incident'
    )
    whichProtectedCharacteristic.checkbox('1-4-2-1-1').check()
    whichProtectedCharacteristic.checkbox('1-4-2-1-2').check()
    whichProtectedCharacteristic.continueCheckboxes().click()

    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

    detailsOfOffencePage
      .offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(5).innerText).to.contain(
          'causes damage to, or destruction of, any part of a prison or any other property, other than his own, aggravated by a protected characteristic'
        )
      })

    detailsOfOffencePage.saveAndContinue().click()
  })
  it('displays, attaches or draws on any part of a prison, or on any other property, threatening, abusive or insulting words, drawings, symbols or other material, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic 24(a)', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-4').check()
    whatTypeOfOffencePage.continue().click()

    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-4-3').check()
    whatTypeOfOffencePage.continue().click()

    // now this should lead to the new page
    const whichProtectedCharacteristic = new OffenceCodeSelection(
      'Select which protected characteristics were part of the reason for the incident'
    )
    whichProtectedCharacteristic.checkbox('1-4-3-2').check()
    whichProtectedCharacteristic.continueCheckboxes().click()

    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

    detailsOfOffencePage
      .offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(3).innerText).to.contain('Disability')
        expect($summaryData.get(4).innerText).to.contain(
          'uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic'
        )
      })

    detailsOfOffencePage.saveAndContinue().click()
    cy.url().should('include', adjudicationUrls.detailsOfDamages.urls.start('100'))
  })
  it('commits any sexual assault- 1(b)', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()

    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-1-4').check()
    whatTypeOfOffencePage.continue().click()

    // now this should lead to the new page
    const whatDidTheIncidentInvolve2 = new OffenceCodeSelection('What happened?')
    whatDidTheIncidentInvolve2.radio('1-1-4-1').check()
    whatDidTheIncidentInvolve2.continue().click()

    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

    detailsOfOffencePage
      .offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(2).innerText).to.contain('Sexual offence or obscene act')
        expect($summaryData.get(3).innerText).to.contain('Sexual assault')
        expect($summaryData.get(4).innerText).to.contain('commits any sexual assault')
      })
  })
  it('exposes himself, or commits any other indecent or obscene act- 1(c)', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()

    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-1-4').check()
    whatTypeOfOffencePage.continue().click()

    // now this should lead to the new page
    const whatDidTheIncidentInvolve2 = new OffenceCodeSelection('What happened?')
    whatDidTheIncidentInvolve2.radio('1-1-4-2').check()
    whatDidTheIncidentInvolve2.continue().click()

    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

    detailsOfOffencePage
      .offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(2).innerText).to.contain('Sexual offence or obscene act')
        expect($summaryData.get(3).innerText).to.contain('Exposes themselves or any other indecent or obscene act')
        expect($summaryData.get(4).innerText).to.contain(
          'exposes himself, or commits any other indecent or obscene act'
        )
      })
  })
  it('sexually harasses any person- 1(d)', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()

    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-1-4').check()
    whatTypeOfOffencePage.continue().click()

    // now this should lead to the new page
    const whatDidTheIncidentInvolve2 = new OffenceCodeSelection('What happened?')
    whatDidTheIncidentInvolve2.radio('1-1-4-3').check()
    whatDidTheIncidentInvolve2.continue().click()

    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

    detailsOfOffencePage
      .offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(2).innerText).to.contain('Sexual offence or obscene act')
        expect($summaryData.get(3).innerText).to.contain('Sexually harasses any person')
        expect($summaryData.get(4).innerText).to.contain('sexually harasses any person')
      })
  })
  it('delete offence from session', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-4').check()
    whatTypeOfOffencePage.continue().click()

    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-4-3').check()
    whatTypeOfOffencePage.continue().click()

    // now this should lead to the new page
    const whichProtectedCharacteristic = new OffenceCodeSelection(
      'Select which protected characteristics were part of the reason for the incident'
    )
    whichProtectedCharacteristic.checkbox('1-4-3-2').check()
    whichProtectedCharacteristic.continueCheckboxes().click()

    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.deleteLink(1).click()

    cy.url().should(
      'include',
      adjudicationUrls.detailsOfOffence.urls.delete(100, {
        offenceCode: '2410124',
        protectedCharacteristics: ['1-4-3-2'],
      })
    )
  })
  it('delete offence from draft', () => {
    cy.visit(adjudicationUrls.detailsOfOffence.urls.start(101))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.deleteLink(1).click()

    cy.url().should(
      'include',
      adjudicationUrls.detailsOfOffence.urls.delete(101, {
        offenceCode: '2410124',
        protectedCharacteristics: ['2'],
      })
    )
  })
})

context('v2 offences - assault 1(a)', () => {
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
      offenceCode: 100124,
      response: {
        paragraphNumber: '1(a)',
        paragraphDescription: 'commits any assault aggravated by a protected characteristic',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 100324,
      response: {
        paragraphNumber: '1(a)',
        paragraphDescription: 'commits any assault aggravated by a protected characteristic',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 100524,
      response: {
        paragraphNumber: '1(a)',
        paragraphDescription: 'commits any assault aggravated by a protected characteristic',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 102124,
      response: {
        paragraphNumber: '1(a)',
        paragraphDescription: 'commits any assault aggravated by a protected characteristic',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 100724,
      response: {
        paragraphNumber: '1(a)',
        paragraphDescription: 'commits any assault aggravated by a protected characteristic',
      },
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
      }),
    })
    // Prison officer victim
    cy.task('stubGetUserFromUsername', {
      username: 'AOWENS',
      response: testData.userFromUsername('AOWENS'),
    })
    cy.task('stubGetEmail', {
      username: 'AOWENS',
      response: testData.emailFromUsername('AOWENS'),
    })
    // Staff victim
    cy.task('stubGetUserFromUsername', {
      username: 'CSTANLEY',
      response: testData.userFromUsername('CSTANLEY'),
    })
    cy.task('stubGetEmail', {
      username: 'CSTANLEY',
      response: testData.emailFromUsername('CSTANLEY'),
    })
    cy.task('stubSearchPrisonerDetails', {
      prisonerNumber: 'G7123CI',
    })
    cy.task('stubSaveOffenceDetails', {
      draftId: 100,
      response: {},
    })
  })
  ;[
    {
      testName: '1(a) -prisoner',
      code: '1',
    },
    {
      testName: '1(a) - prison officer',
      code: '2',
    },
    {
      testName: '1(a) - staff member',
      code: '3',
    },
    {
      testName: '1(a) - external prisoner',
      code: '4',
    },
    {
      testName: '1(a) - someone else',
      code: '5',
    },
  ].forEach(test => {
    it(test.testName, () => {
      cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
      const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
      whatTypeOfOffencePage.radio('1-1').check()
      whatTypeOfOffencePage.continue().click()

      const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
      whatDidTheIncidentInvolve.radio('1-1-1').check()
      whatTypeOfOffencePage.continue().click()

      const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
      whatTypeOfOffencePage.radio(`1-1-1-${test.code}`).check()

      // who was assaulted
      switch (test.code) {
        case '1':
          whoWasAssaultedPage.simulateReturnFromPrisonerSearch(100, '1-1-1', `1-1-1-${test.code}`, 'G5512G')
          break
        case '2':
          whoWasAssaultedPage.simulateReturnFromStaffSearch(100, `1-1-1`, `1-1-1-${test.code}`, 'AOWENS')
          break
        case '3':
          whoWasAssaultedPage.simulateReturnFromStaffSearch(100, '1-1-1', `1-1-1-${test.code}`, 'CSTANLEY')
          break
        case '4':
          whoWasAssaultedPage.prisonerOutsideEstablishmentNameInput().type('James Robertson')
          whoWasAssaultedPage.prisonerOutsideEstablishmentNumberInput().type('G7123CI')
          break
        case '5':
          whoWasAssaultedPage.victimOtherPersonSearchNameInput().type('James Peterson')
          break
        default:
      }
      whoWasAssaultedPage.continue().click()

      // now add the new path
      const aggravateByProtectedCharacteristic = new OffenceCodeSelection(
        'Was the incident aggravated by a protected characteristic?'
      )
      aggravateByProtectedCharacteristic.radio(`1-1-1-${test.code}-1`).check()
      whatTypeOfOffencePage.continue().click()

      // now this should lead to the new page
      const whichProtectedCharacteristic = new OffenceCodeSelection(
        'Select which protected characteristics were part of the reason for the incident'
      )
      whichProtectedCharacteristic.checkbox(`1-1-1-${test.code}-1-1`).check()
      whichProtectedCharacteristic.checkbox(`1-1-1-${test.code}-1-2`).check()
      whichProtectedCharacteristic.continueCheckboxes().click()

      const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)

      detailsOfOffencePage
        .offenceDetailsSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(5).innerText).to.contain('Age, Disability')
          expect($summaryData.get(6).innerText).to.contain(
            'commits any assault aggravated by a protected characteristic'
          )
        })

      detailsOfOffencePage.saveAndContinue().click()
      cy.url().should('include', adjudicationUrls.detailsOfDamages.urls.start('100'))
    })
  })
})

context('v2 offences ALO', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })

    cy.task('stubGetLocation', {})

    cy.task('stubGetDpsLocationId', {})

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
    cy.task('stubSaveOffenceDetails', {
      draftId: 177,
      response: {},
    })
    cy.task('stubSaveOffenceDetails', {
      draftId: 1777,
      response: {},
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
      key: ['1-5-2-1'],
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
      key: ['1-5-2-1'],
    },
    {
      testName: '1700124 > 17(a) ',
      radio: '17(a)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '1700124',
      isYouthOffender: false,
      chargeNumber: '12345',
      additionalQuestion: true,
      key: ['1-4-2', '1-4-2-1'],
    },
    {
      testName: '1700124 > 19 ',
      radio: '19',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '1700124',
      isYouthOffender: true,
      chargeNumber: '123456',
      additionalQuestion: true,
      key: ['1-4-2', '1-4-2-1'],
    },
    {
      testName: '2410124 > 24(a) ',
      radio: '24(a)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '2410124',
      isYouthOffender: false,
      chargeNumber: '12345',
      additionalQuestion: true,
      key: ['1-4-3'],
    },
    {
      testName: '2410124 > 28 ',
      radio: '28',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '2410124',
      isYouthOffender: true,
      chargeNumber: '123456',
      additionalQuestion: true,
      key: ['1-4-3'],
    },
    {
      testName: '102224 > 1(b) ',
      radio: '1(b)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '102224',
      isYouthOffender: false,
      chargeNumber: '12345',
    },
    {
      testName: '102224 > 2(a) ',
      radio: '2(a)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '102224',
      isYouthOffender: true,
      chargeNumber: '123456',
    },
    {
      testName: '102324 > 1(c) ',
      radio: '1(c)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '102324',
      isYouthOffender: false,
      chargeNumber: '12345',
    },
    {
      testName: '102324 > 2(b) ',
      radio: '2(b)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '102324',
      isYouthOffender: true,
      chargeNumber: '123456',
    },
    {
      testName: '102424 > 1(d) ',
      radio: '1(d)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '102424',
      isYouthOffender: false,
      chargeNumber: '12345',
    },
    {
      testName: '102424 > 2(c) ',
      radio: '2(c)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '102424',
      isYouthOffender: true,
      chargeNumber: '123456',
    },
    {
      testName: '100724 > 1(a) ',
      radio: '1(a)',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '100724',
      isYouthOffender: false,
      chargeNumber: '12345',
      additionalQuestion: true,
      key: ['89-5', '89-5'],
      skipProtectedYesNo: true,
    },
    {
      testName: '100724 > 2 ',
      radio: '2',
      radio2: null,
      title: 'Who was assaulted?',
      offenceCode: '100724',
      isYouthOffender: true,
      chargeNumber: '123456',
      additionalQuestion: true,
      key: ['89-5', '89-5'],
      skipProtectedYesNo: true,
    },
  ].forEach(test => {
    it(test.testName, () => {
      if (test.isYouthOffender) {
        cy.task('stubGetOffenceRule', {
          offenceCode: 2600124,
          isYouthOffender: true,
          response: {
            paragraphNumber: '26(a)',
            paragraphDescription: 'Failure to comply with any payback punishment',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 2000124,
          isYouthOffender: true,
          response: {
            paragraphNumber: '23',
            paragraphDescription:
              'Uses threatening, abusive or insulting words or behaviour, which demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them sharing a protected characteristic',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 1700124,
          isYouthOffender: true,
          response: {
            paragraphNumber: '19',
            paragraphDescription:
              'causes damage to, or destruction of, any part of a young offender institution or any other property, other than his own, aggravated by a protected characteristic',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 2410124,
          isYouthOffender: true,
          response: {
            paragraphNumber: '28',
            paragraphDescription:
              'displays, attaches or draws on any part of a young offender institution, or on any other property,  threatening, abusive or insulting words, drawings, symbols or other material, which  demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them  sharing a protected characteristic',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 102224,
          isYouthOffender: true,
          response: {
            paragraphNumber: '2(a)',
            paragraphDescription: 'commits any sexual assault',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 102324,
          isYouthOffender: true,
          response: {
            paragraphNumber: '2(b)',
            paragraphDescription: 'exposes himself, or commits any other indecent or obscene act',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 102424,
          isYouthOffender: true,
          response: {
            paragraphNumber: '2(c)',
            paragraphDescription: 'sexually harasses any person',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 100724,
          isYouthOffender: true,
          response: {
            paragraphNumber: '2',
            paragraphDescription: 'commits any assault aggravated by a protected characteristic',
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
        cy.task('stubGetOffenceRule', {
          offenceCode: 1700124,
          response: {
            paragraphNumber: '17(a)',
            paragraphDescription:
              'causes damage to, or destruction of, any part of a prison or any other property, other than his own, aggravated by a protected characteristic',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 2410124,
          response: {
            paragraphNumber: '24(a)',
            paragraphDescription:
              'displays, attaches or draws on any part of a young offender institution, or on any other property,  threatening, abusive or insulting words, drawings, symbols or other material, which  demonstrate, or are motivated (wholly or partly) by, hostility to persons based on them  sharing a protected characteristic',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 102224,
          response: {
            paragraphNumber: '1(b)',
            paragraphDescription: 'commits any sexual assault',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 102324,
          response: {
            paragraphNumber: '1(c)',
            paragraphDescription: 'exposes himself, or commits any other indecent or obscene act',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 102424,
          response: {
            paragraphNumber: '1(d)',
            paragraphDescription: 'sexually harasses any person',
          },
        })
        cy.task('stubGetOffenceRule', {
          offenceCode: 100724,
          response: {
            paragraphNumber: '1(a)',
            paragraphDescription: 'commits any assault aggravated by a protected characteristic',
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
        if (test.key.length === 1) {
          cy.location().should(loc => {
            expect(loc.pathname).to.contain(`/${test.key}`)
          })
        } else if (test.skipProtectedYesNo !== true) {
          const aggravateByProtectedCharacteristic = new OffenceCodeSelection(
            'Was the incident aggravated by a protected characteristic?'
          )
          aggravateByProtectedCharacteristic.radio(`${test.key[0]}-1`).check()
          test.key.shift()
          aggravateByProtectedCharacteristic.continue().click()
        } else {
          const whoWasAssaulted = new OffenceCodeSelection('Who was assaulted?')
          whoWasAssaulted.radio(`${test.key[0]}`).check()
          whoWasAssaulted.victimOtherPersonSearchNameInput().type('James Peterson')
          test.key.shift()
          whoWasAssaulted.continue().click()
        }
        const whichProtectedCharacteristic = new OffenceCodeSelection(
          'Select which protected characteristics were part of the reason for the incident'
        )
        whichProtectedCharacteristic.checkbox(`${test.key[0]}-1`).check()
        whichProtectedCharacteristic.continueCheckboxes().click()

        const detailsOfOffence = Page.verifyOnPage(DetailsOfOffence)
        detailsOfOffence.saveAndContinue().click()
        cy.url().should(
          'include',
          adjudicationUrls.prisonerReport.urls.review(test.isYouthOffender ? '123456' : '12345')
        )
      }
    })
  })
})
