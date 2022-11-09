import moment from 'moment'
import ScheduleHearingPage from '../pages/scheduleHearing'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { forceDateInputWithDate } from '../componentDrivers/dateInput'
import { ReviewStatus } from '../../server/routes/prisonerReport/prisonerReportReviewValidation'
import { OicHearingType } from '../../server/data/ReportedAdjudicationResult'

const prisonerDetails = (prisonerNumber: string, firstName: string, lastName: string) => {
  return {
    offenderNo: prisonerNumber,
    firstName,
    lastName,
    assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
  }
}

const reportedAdjudicationResponse = (adjudicationNumber: number, hearings = []) => {
  return {
    reportedAdjudication: {
      adjudicationNumber,
      prisonerNumber: 'G6415GD',
      bookingId: 1,
      createdDateTime: undefined,
      createdByUserId: undefined,
      incidentDetails: {
        locationId: 197682,
        dateTimeOfIncident: '2021-12-09T10:30:00',
        handoverDeadline: '2021-12-11T10:30:00',
      },
      incidentStatement: undefined,
      incidentRole: {
        roleCode: undefined,
      },
      offenceDetails: [],
      isYouthOffender: false,
      status: ReviewStatus.UNSCHEDULED,
      reviewedByUserId: 'USER1',
      statusReason: undefined,
      statusDetails: undefined,
      damages: [],
      evidence: [],
      witnesses: [],
      hearings,
    },
  }
}

const singleHearing = [
  {
    id: 987,
    dateTimeOfHearing: '2030-01-01T11:00:00',
    locationId: 123,
    oicHearingType: OicHearingType.GOV_ADULT as string,
  },
]

context('Schedule a hearing page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'USER1',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: prisonerDetails('G6415GD', 'JOHN', 'SMITH'),
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: [
        {
          locationId: 234,
          agencyId: 'MDI',
          userDescription: 'Adj 2',
        },
        {
          locationId: 123,
          agencyId: 'MDI',
          userDescription: 'Adj 1',
        },
        {
          locationId: 345,
          agencyId: 'MDI',
          userDescription: 'Adj 3',
        },
      ],
    })
    cy.task('stubGetLocation', {
      locationId: 123,
      response: {
        locationId: 123,
        agencyId: 'MDI',
        userDescription: 'Adj 1',
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, singleHearing),
    })
    cy.task('stubScheduleHearing', {
      adjudicationNumber: 1524494,
      response: reportedAdjudicationResponse(1524494, singleHearing),
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().should('exist')
    scheduleHearingsPage.datePicker().should('exist')
    scheduleHearingsPage.timeInputHours().should('exist')
    scheduleHearingsPage.timeInputMinutes().should('exist')
    scheduleHearingsPage.locationSelector().should('exist')
    scheduleHearingsPage.submitButton().should('exist')
  })
  it('should submit the form successfully if all data is input', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Adj 1')
    forceDateInputWithDate(new Date('2030-01-01'), '[data-qa="hearing-date"]')
    scheduleHearingsPage.timeInputHours().select('11')
    scheduleHearingsPage.timeInputMinutes().select('00')
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524494))
    })
  })
  it('should show error if hearing type is missing', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    forceDateInputWithDate(new Date('2030-01-01'), '[data-qa="hearing-date"]')
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
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    forceDateInputWithDate(new Date('2030-01-01'), '[data-qa="hearing-date"]')
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
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Adj 1')
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
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Adj 1')
    forceDateInputWithDate(new Date('2030-01-01'), '[data-qa="hearing-date"]')
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
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Adj 1')
    forceDateInputWithDate(new Date('2030-01-01'), '[data-qa="hearing-date"]')
    scheduleHearingsPage.timeInputHours().select('10')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select time of hearing')
      })
  })
  it('should show error if the time entered is in the past', () => {
    const now = moment().toDate()
    const oneHourAgo = moment().subtract(1, 'hour').format('HH').toString()
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click()
    scheduleHearingsPage.locationSelector().select('Adj 1')
    forceDateInputWithDate(now, '[data-qa="hearing-date"]')
    scheduleHearingsPage.timeInputHours().select(oneHourAgo)
    scheduleHearingsPage.timeInputMinutes().select('00')
    scheduleHearingsPage.submitButton().click()
    scheduleHearingsPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('The hearing time must be in the future')
      })
  })
  it('should return to the hearing details page if the cancel link is clicked', () => {
    cy.visit(adjudicationUrls.scheduleHearing.urls.start(1524494))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.cancelLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524494))
    })
  })
})
