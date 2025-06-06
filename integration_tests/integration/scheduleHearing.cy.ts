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
      hearings,
      status: ReportedAdjudicationStatus.UNSCHEDULED,
    }),
  }
}

const singleHearing = [
  testData.singleHearing({
    dateTimeOfHearing: '2030-01-01T11:00:00',
    id: 987,
  }),
]

const date = formatDateForDatePicker(new Date('1/1/2030').toISOString(), 'short')
const date1 = formatDateForDatePicker(new Date('12/31/2029').toISOString(), 'short')

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

    cy.task('stubGetNomisLocationId', {})

    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse('1524494', singleHearing),
    })
    cy.task('stubScheduleHearing', {
      chargeNumber: 1524494,
      response: reportedAdjudicationResponse('1524494', singleHearing),
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().should('exist')
    scheduleHearingsPage.datePicker().should('exist')
    scheduleHearingsPage.timeInputHours().should('exist')
    scheduleHearingsPage.timeInputMinutes().should('exist')
    scheduleHearingsPage.locationSelector().should('exist')
    scheduleHearingsPage.submitButton().should('exist')
  })
  it('should submit the form successfully if all data is input', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Houseblock 1')
    scheduleHearingsPage.datePicker().type(date)
    scheduleHearingsPage.timeInputHours().select('11')
    scheduleHearingsPage.timeInputMinutes().select('05')
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524494'))
    })
  })
  it('should show error if hearing type is missing', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.datePicker().type(date)
    scheduleHearingsPage.timeInputHours().select('10')
    scheduleHearingsPage.timeInputMinutes().select('30')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select type of hearing')
      })
  })
  it('should show error if location is missing', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.datePicker().type(date)
    scheduleHearingsPage.timeInputHours().select('10')
    scheduleHearingsPage.timeInputMinutes().select('30')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select location of hearing')
      })
  })
  it('should show error if date is missing', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Houseblock 1')
    scheduleHearingsPage.timeInputHours().select('10')
    scheduleHearingsPage.timeInputMinutes().select('30')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter date of hearing')
      })
  })
  it('should show error if hour is missing', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Houseblock 1')
    scheduleHearingsPage.datePicker().type(date)
    scheduleHearingsPage.timeInputMinutes().select('30')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select time of hearing')
      })
  })
  it('should show error if minute is missing', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Houseblock 1')
    scheduleHearingsPage.datePicker().type(date)
    scheduleHearingsPage.timeInputHours().select('10')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select time of hearing')
      })
  })
  it('should show error if the date entered is before the date of any existing hearings', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Houseblock 1')
    scheduleHearingsPage.datePicker().type(date1)
    scheduleHearingsPage.timeInputHours().select('11')
    scheduleHearingsPage.timeInputMinutes().select('00')
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
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Houseblock 1')
    scheduleHearingsPage.datePicker().type(date)
    scheduleHearingsPage.timeInputHours().select('10')
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
  it('should show error if the date and time entered are before the date and time of any existing hearings', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Houseblock 1')
    scheduleHearingsPage.datePicker().type(date1)
    scheduleHearingsPage.timeInputHours().select('10')
    scheduleHearingsPage.timeInputMinutes().select('00')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain(
          'The date of this hearing must be after the date of the previous hearing'
        )
        expect($errors.get(1).innerText).to.contain(
          'The time of this hearing must be after the time of the previous hearing'
        )
      })
  })
  it('should return to the hearing details page if the cancel link is clicked', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start('1524494'))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.cancelLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('1524494'))
    })
  })
})
