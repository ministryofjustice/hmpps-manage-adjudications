import ScheduleHearingPage from '../pages/scheduleHearing'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import { forceDateInputWithDate } from '../componentDrivers/dateInput'
import { ReviewStatus } from '../../server/routes/prisonerReport/prisonerReportReviewValidation'

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

const originalHearing = [
  {
    id: 333,
    dateTimeOfHearing: '2030-01-01T11:00:00',
    locationId: 123,
    oicHearingType: 'GOV_ADULT',
  },
]

const changedDayHearing = [
  {
    id: 333,
    dateTimeOfHearing: '2030-01-02T11:00:00',
    locationId: 123,
    oicHearingType: 'GOV_ADULT',
  },
]
const changedTimeHearing = [
  {
    id: 333,
    dateTimeOfHearing: '2030-01-01T11:30:00',
    locationId: 123,
    oicHearingType: 'GOV_ADULT',
  },
]
const changedLocationHearing = [
  {
    id: 333,
    dateTimeOfHearing: '2030-01-01T11:00:00',
    locationId: 234,
    oicHearingType: 'GOV_ADULT',
  },
]
const changedTypeHearing = [
  {
    id: 333,
    dateTimeOfHearing: '2030-01-01T11:00:00',
    locationId: 123,
    oicHearingType: 'INAD_ADULT',
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
    scheduleHearingsPage.locationSelector().should('have.value', '123')
    scheduleHearingsPage.locationSelectorSelectedOption().should('have.text', 'Adj 1')
  })
  it('should submit the form successfully when location is changed', () => {
    cy.task('stubAmendHearing', {
      adjudicationNumber: 1524494,
      hearingId: 333,
      response: reportedAdjudicationResponse(1524494, changedLocationHearing),
    })
    cy.task('stubGetLocation', {
      locationId: 234,
      response: {
        locationId: 234,
        agencyId: 'MDI',
        userDescription: 'Adj 2',
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524494,
      response: reportedAdjudicationResponse(1524494, changedLocationHearing),
    })
    cy.visit(adjudicationUrls.scheduleHearing.urls.edit(1524494, 333))
    const scheduleHearingsPage: ScheduleHearingPage = Page.verifyOnPage(ScheduleHearingPage)
    scheduleHearingsPage.locationSelector().select('234')
    scheduleHearingsPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(1524494))
    })
  })
  it('should submit the form successfully when the type is changed', () => {
    cy.task('stubAmendHearing', {
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
    cy.task('stubAmendHearing', {
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
    cy.task('stubAmendHearing', {
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
