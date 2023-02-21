import ScheduleHearingPage from '../pages/scheduleHearing'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { forceDateInputWithDate } from '../componentDrivers/dateInput'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

const reportedAdjudicationResponse = (adjudicationNumber: number, hearings = []) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-12-09T10:30:00',
      status: ReportedAdjudicationStatus.UNSCHEDULED,
      hearings,
    }),
  }
}

const hearingDateTime = '2030-01-01T11:00:00'

const originalHearing = [
  testData.singleHearing({
    dateTimeOfHearing: hearingDateTime,
    id: 333,
    locationId: 25538,
  }),
]

const changedDayHearing = [
  testData.singleHearing({
    dateTimeOfHearing: '2030-01-02T11:00:00',
    id: 333,
    locationId: 25538,
  }),
]

const changedTimeHearing = [
  testData.singleHearing({
    dateTimeOfHearing: '2030-01-01T11:30:00',
    id: 333,
    locationId: 25538,
  }),
]

const changedLocationHearing = [
  testData.singleHearing({
    dateTimeOfHearing: hearingDateTime,
    id: 333,
    locationId: 25655,
  }),
]

const changedTypeHearing = [
  {
    ...testData.singleHearing({
      dateTimeOfHearing: hearingDateTime,
    }),
    oicHearingType: OicHearingType.INAD_ADULT as string,
  },
]

context('Schedule a hearing page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetLocationsByType', {
      agencyId: 'MDI',
      response: testData.residentialLocations(),
    })
    cy.task('stubGetLocation', {
      locationId: 25538,
      response: testData.residentialLocations()[0],
    })

    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, originalHearing),
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().should('exist')
    scheduleHearingsPage.datePicker().should('exist')
    scheduleHearingsPage.timeInputHours().should('exist')
    scheduleHearingsPage.timeInputMinutes().should('exist')
    scheduleHearingsPage.locationSelector().should('exist')
    scheduleHearingsPage.submitButton().should('exist')
  })
  it('should have pre-filled fields', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').should('be.checked')
    scheduleHearingsPage.datePicker().should('have.value', '01/01/2030')
    scheduleHearingsPage.timeInputHours().should('have.value', '11')
    scheduleHearingsPage.timeInputMinutes().should('have.value', '00')
    scheduleHearingsPage.locationSelector().should('have.value', '25538')
    scheduleHearingsPage.locationSelectorSelectedOption().should('have.text', 'Houseblock 1')
  })
  it('should submit the form successfully when location is changed', () => {
    cy.task('stubAmendHearingV1', {
      adjudicationNumber: 1524494,
      hearingId: 333,
      response: reportedAdjudicationResponse(1524494, changedLocationHearing),
    })

    cy.task('stubGetLocation', {
      locationId: 25538,
      response: testData.residentialLocations()[1],
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, changedLocationHearing),
    })
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.locationSelector().select('25655')
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524494))
    })
  })
  it('should submit the form successfully when the type is changed', () => {
    cy.task('stubAmendHearingV1', {
      adjudicationNumber: 1524494,
      hearingId: 333,
      response: reportedAdjudicationResponse(1524494, changedTypeHearing),
    })
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="IND_ADJ"]').click()
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524494))
    })
  })
  it('should submit the form successfully when the date is changed', () => {
    cy.task('stubAmendHearingV1', {
      adjudicationNumber: 1524494,
      hearingId: 333,
      response: reportedAdjudicationResponse(1524494, changedDayHearing),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, changedDayHearing),
    })
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    forceDateInputWithDate(new Date('2030-01-02'), '[data-qa="hearing-date"]')
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524494))
    })
  })
  it('should submit the form successfully when the time is changed', () => {
    cy.task('stubAmendHearingV1', {
      adjudicationNumber: 1524494,
      hearingId: 333,
      response: reportedAdjudicationResponse(1524494, changedTimeHearing),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, changedTimeHearing),
    })
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.timeInputHours().select('11')
    scheduleHearingsPage.timeInputMinutes().select('30')
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524494))
    })
  })
  it('should show error if hour is removed', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.timeInputHours().select('--')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select time of hearing')
      })
  })
  it('should show error if minute is removed', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.timeInputMinutes().select('--')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select time of hearing')
      })
  })
  it('should show error if location is removed', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.locationSelector().select('Select')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select location of hearing')
      })
  })
})
