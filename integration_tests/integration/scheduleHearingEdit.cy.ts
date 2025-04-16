import ScheduleHearingPage from '../pages/scheduleHearing'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()

const reportedAdjudicationResponse = (chargeNumber: string, hearings = []) => {
  return {
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-12-09T10:30:00',
      status: ReportedAdjudicationStatus.UNSCHEDULED,
      hearings,
    }),
  }
}

const hearingDateTime = '2030-01-01T11:00:00'

const previouslyExistingHearing = [
  testData.singleHearing({
    dateTimeOfHearing: '2029-11-20T12:00:00',
    id: 332,
    locationId: 25538,
  }),
  testData.singleHearing({
    dateTimeOfHearing: '2029-12-01T11:00:00',
    id: 333,
    locationId: 25538,
  }),
]

const changedDayHearing = testData.singleHearing({
  dateTimeOfHearing: '2030-01-02T11:00:00',
  id: 333,
  locationId: 25538,
})

const changedTimeHearing = testData.singleHearing({
  dateTimeOfHearing: '2030-01-01T11:30:00',
  id: 333,
  locationId: 25538,
})

const changedLocationHearing = testData.singleHearing({
  dateTimeOfHearing: hearingDateTime,
  id: 333,
  locationId: 25655,
})

context('Schedule a hearing page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })

    cy.task('stubGetAdjudicationLocations', {
      prisonId: 'MDI',
      response: testData.residentialLocationsFromLocationsApi(),
    })

    cy.task('stubGetLocationWithUuid', {})

    cy.task('stubGetLocation', {
      locationId: 'location-2',
      response: {
        id: 'location-2',
        prisonId: 'MDI',
        key: 'MDI-2',
        localName: 'Houseblock 2',
      },
    })

    cy.task('stubGetNomisLocationId', {})

    cy.task('stubGetDpsLocationId', {})

    cy.task('stubGetNomisLocationId', {
      dpsLocationId: 'location-2',
      response: {
        nomisLocationId: 25655,
      },
    })

    cy.task('stubGetDpsLocationId', {
      nomisLocationId: 25655,
      response: {
        dpsLocationId: 'location-2',
      },
    })

    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse('1524494', previouslyExistingHearing),
    })
    cy.task('stubAmendHearing', {
      chargeNumber: 1524494,
      response: reportedAdjudicationResponse('1524494', [...previouslyExistingHearing, changedDayHearing]),
    })

    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().should('exist')
    scheduleHearingsPage.datePicker().should('exist')
    scheduleHearingsPage.timeInputHours().should('exist')
    scheduleHearingsPage.timeInputMinutes().should('exist')
    scheduleHearingsPage.locationSelector().should('exist')
    scheduleHearingsPage.submitButton().should('exist')
  })
  it('should have pre-filled fields', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').should('be.checked')
    scheduleHearingsPage.datePicker().should('have.value', '01/12/2029')
    scheduleHearingsPage.timeInputHours().should('have.value', '11')
    scheduleHearingsPage.timeInputMinutes().should('have.value', '00')
    scheduleHearingsPage.locationSelector().should('have.value', 'location-1')
    scheduleHearingsPage.locationSelectorSelectedOption().should('have.text', 'Houseblock 1')
  })
  it('should submit the form successfully when location is changed', () => {
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse('1524494', [changedLocationHearing]),
    })
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.locationSelector().select('location-2')
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524494'))
    })
  })
  it('should submit the form successfully when the type is changed', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="IND_ADJ"]').click()
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524494'))
    })
  })
  it('should submit the form successfully when the date is changed', () => {
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse('1524494', [changedDayHearing]),
    })
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    const date = formatDateForDatePicker(new Date('2/1/2030').toISOString(), 'short')
    scheduleHearingsPage.datePicker().type(date)
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524494'))
    })
  })
  it('should submit the form successfully when the time is changed', () => {
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse('1524494', [changedTimeHearing]),
    })
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.timeInputHours().select('11')
    scheduleHearingsPage.timeInputMinutes().select('30')
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524494'))
    })
  })
  it('should show error if hour is removed', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
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
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
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
  it('should show error if the date entered is before the date of any existing hearings', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.locationSelector().select('Houseblock 1')
    const date = formatDateForDatePicker(new Date('11/19/2029').toISOString(), 'short')
    scheduleHearingsPage.datePicker().clear().type(date)
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain(
          'The date of this hearing must be after the date of the previous hearing'
        )
      })
  })
  it('should show error if the time entered is before the datetime of any existing hearings', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    const date = formatDateForDatePicker(new Date('11/20/2029').toISOString(), 'short')
    scheduleHearingsPage.datePicker().clear().type(date)
    scheduleHearingsPage.timeInputHours().select('09')
    scheduleHearingsPage.timeInputMinutes().select('00')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain(
          'The time of this hearing must be after the time of the previous hearing'
        )
      })
  })
  it('should show error if the date and time entered is the same as the latest hearing', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    const date = formatDateForDatePicker(new Date('11/20/2029').toISOString(), 'short')
    scheduleHearingsPage.datePicker().clear().type(date)
    scheduleHearingsPage.timeInputHours().select('12')
    scheduleHearingsPage.timeInputMinutes().select('00')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain(
          'The time of this hearing must be after the time of the previous hearing'
        )
      })
  })
  it('should show error if location is removed', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit('1524494', 333))
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
