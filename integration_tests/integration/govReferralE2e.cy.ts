import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import EnterHearingOutcomePage from '../pages/enterHearingOutcome'
import HearingReasonForReferral from '../pages/hearingReasonForReferral'
import HearingReferralConfirmation from '../pages/hearingReferralConfirmation'
import HearingTabPage from '../pages/hearingTab'
import NextStepsGovPage from '../pages/nextStepsGov'
import NotProceedPage from '../pages/notProceed'
import ReasonForGovReferral from '../pages/reasonForGovReferral'

import TestData from '../../server/routes/testutils/testData'
import {
  HearingOutcomeCode,
  NotProceedReason,
  OutcomeCode,
  OutcomeHistory,
  ReferGovReason,
  ReferralOutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import SelectAssociatedStaff from '../pages/selectAssociatedStaff'
import NextStepsInadPage from '../pages/nextStepsInad'
import ScheduleHearingPage from '../pages/scheduleHearing'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()
context("Inad refers to gov who doesn't proceed - hearing outcome is REFER_GOV", () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    // Staff Member
    cy.task('stubGetUserFromNames', {
      staffFirstName: 'John',
      staffLastName: 'Smith',
      response: [testData.staffFromName()],
    })
    // Staff Member
    cy.task('stubGetUserFromUsername', {
      username: 'JSMITH_GEN',
      response: testData.userFromUsername('JSMITH_GEN'),
    })
    cy.task('stubGetEmail', {
      username: 'JSMITH_GEN',
      response: testData.emailFromUsername('JSMITH_GEN'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-01-04T09:00:00',
                id: 987,
                locationId: 123,
                oicHearingType: OicHearingType.INAD_ADULT,
              }),
            },
          ] as OutcomeHistory,
          status: ReportedAdjudicationStatus.SCHEDULED,
        }),
      },
    })
    cy.task('stubCreateReferral', {
      chargeNumber: 100,
      hearingId: 987,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetLocation', {
      locationId: 123,
      response: {
        locationId: 123,
        agencyId: 'MDI',
        userDescription: 'Adj 1',
      },
    })
    cy.task('stubCreateNotProceed', {
      chargeNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })

    cy.signIn()
  })
  describe('---', () => {
    it('-', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().type('John Smith')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_GOV"]').check({ force: true })
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
        expect(loc.search).to.eq('?adjudicator=John%20Smith&hearingOutcome=REFER_GOV')
      })
      cy.get('h1').contains('Why has this case been referred back to the governor?')
      cy.get('[data-qa="referGovReason-radio-buttons"]').find('input[value="OTHER"]').check()
      cy.get('[data-qa="referral-reason"]').type('This is my reasoning for referring to the governor')
      cy.get('[data-qa="reason-for-referral-submit"]').click()
      const hearingReferralConfirmation = Page.verifyOnPage(HearingReferralConfirmation)
      cy.task('stubGetReportedAdjudication', {
        id: 100,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '100',
            prisonerNumber: 'G6415GD',
            outcomes: [
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2030-01-04T09:00:00',
                  id: 987,
                  locationId: 123,
                  oicHearingType: OicHearingType.INAD_ADULT,
                  outcome: testData.hearingOutcome({
                    code: HearingOutcomeCode.REFER_GOV,
                    adjudicator: 'John Smith',
                    optionalItems: {
                      details: 'This is my reasoning for referring to the governor',
                    },
                  }),
                }),
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.REFER_GOV,
                    details: 'This is my reasoning for referring to the governor',
                    referGovReason: ReferGovReason.OTHER,
                  }),
                },
              },
            ],
            status: ReportedAdjudicationStatus.REFER_GOV,
          }),
        },
      })
      hearingReferralConfirmation.returnLink().click()
      const hearingTabPage = Page.verifyOnPage(HearingTabPage)
      hearingTabPage.nextStepReferralOutcomeButton().click()
      const nextStepsGovPage = Page.verifyOnPage(NextStepsGovPage)
      nextStepsGovPage.nextStepRadioButtons().find('input[value="not_proceed"]').click({ force: true })
      nextStepsGovPage.submitButton().click()
      const notProceedPage = Page.verifyOnPage(NotProceedPage)
      notProceedPage.notProceedReason().select('Resolved in another way')
      notProceedPage.notProceedDetails().type('This was resolved with a conversation')
      cy.task('stubGetReportedAdjudication', {
        id: 100,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '100',
            prisonerNumber: 'G6415GD',
            outcomes: [
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2030-01-04T09:00:00',
                  id: 987,
                  locationId: 123,
                  oicHearingType: OicHearingType.INAD_ADULT,
                  outcome: testData.hearingOutcome({
                    code: HearingOutcomeCode.REFER_GOV,
                    adjudicator: 'John Smith',
                    optionalItems: {
                      details: 'This is my reasoning for referring to the governor',
                    },
                  }),
                }),
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.REFER_GOV,
                    details: 'This is my reasoning for referring to the governor',
                    referGovReason: ReferGovReason.OTHER,
                  }),
                  referralOutcome: testData.referralOutcome({
                    code: ReferralOutcomeCode.NOT_PROCEED,
                    details: 'This was resolved with a conversation',
                    reason: NotProceedReason.ANOTHER_WAY,
                  }),
                },
              },
            ],
            status: ReportedAdjudicationStatus.NOT_PROCEED,
          }),
        },
      })
      notProceedPage.submitButton().click()
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('4 January 2030 - 09:00')
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Smith')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the governor')
        })
      hearingTabPage.outcomeTableTitle().contains('Governor referral')
      hearingTabPage
        .govReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Why has this case been referred back to the governor?')
          expect($summaryLabel.get(1).innerText).to.contain('Adjudicator’s comments about the referral')
          expect($summaryLabel.get(2).innerText).to.contain('Outcome')
          expect($summaryLabel.get(3).innerText).to.contain('Reason for not proceeding')
        })
      hearingTabPage
        .govReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Other')
          expect($summaryData.get(1).innerText).to.contain('This is my reasoning for referring to the governor')
          expect($summaryData.get(2).innerText).to.contain('Not proceed with the charge')
          expect($summaryData.get(3).innerText).to.contain(
            'Resolved in another way\n\nThis was resolved with a conversation'
          )
        })
    })
  })
})
context('Inad refers to gov after hearing', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    // Staff Member
    cy.task('stubGetUserFromNames', {
      staffFirstName: 'John',
      staffLastName: 'Smith',
      response: [testData.staffFromName()],
    })
    // Staff Member
    cy.task('stubGetUserFromUsername', {
      username: 'JSMITH_GEN',
      response: testData.userFromUsername('JSMITH_GEN'),
    })
    cy.task('stubGetEmail', {
      username: 'JSMITH_GEN',
      response: testData.emailFromUsername('JSMITH_GEN'),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-01-04T09:00:00',
                id: 987,
                locationId: 123,
                oicHearingType: OicHearingType.GOV_ADULT,
              }),
            },
          ] as OutcomeHistory,
          status: ReportedAdjudicationStatus.SCHEDULED,
        }),
      },
    })
    cy.task('stubCreateReferral', {
      chargeNumber: 101,
      hearingId: 987,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetLocation', {
      locationId: 123,
      response: {
        locationId: 123,
        agencyId: 'MDI',
        userDescription: 'Adj 1',
      },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubCreateGovReferral', {
      chargeNumber: '101',
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.task('stubGetLocationsByType', {
      agencyId: 'MDI',
      response: testData.residentialLocations(),
    })
    cy.task('stubScheduleHearing', {
      chargeNumber: 101,
      response: testData.reportedAdjudication({
        chargeNumber: '101',
        prisonerNumber: 'G6415GD',
      }),
    })
    cy.signIn()
  })
  describe('---', () => {
    it('-', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start('101'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.governorName().type('John Smith')
      enterHearingOutcomePage.searchButton().click()
      const SelectStaffMemberPage = new SelectAssociatedStaff()
      SelectStaffMemberPage.selectStaffMemberLink('JSMITH_GEN').click()
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_INAD"]').check({ force: true })
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start('101'))
        expect(loc.search).to.eq('?adjudicator=JSMITH_GEN&hearingOutcome=REFER_INAD')
      })
      const hearingReasonForReferral = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferral.referralReason().type('This is my reasoning')
      hearingReasonForReferral.submitButton().click()
      const hearingReferralConfirmation = Page.verifyOnPage(HearingReferralConfirmation)
      cy.task('stubGetReportedAdjudication', {
        id: 101,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '101',
            prisonerNumber: 'G6415GD',
            outcomes: [
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2030-01-04T09:00:00',
                  id: 987,
                  locationId: 123,
                  oicHearingType: OicHearingType.GOV_ADULT,
                  outcome: testData.hearingOutcome({
                    code: HearingOutcomeCode.REFER_INAD,
                    adjudicator: 'JSMITH_GEN',
                    optionalItems: {
                      details: 'This is my reasoning',
                    },
                  }),
                }),
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.REFER_INAD,
                    details: 'This is my reasoning',
                  }),
                },
              },
            ],
            status: ReportedAdjudicationStatus.REFER_INAD,
          }),
        },
      })
      hearingReferralConfirmation.returnLink().click()
      const hearingTabPage = Page.verifyOnPage(HearingTabPage)
      hearingTabPage.nextStepReferralOutcomeButton().click()
      const nextStepsInadPage = Page.verifyOnPage(NextStepsInadPage)
      nextStepsInadPage.nextStepRadioButtons().find('input[value="refer_gov"]').click({ force: true })
      nextStepsInadPage.submitButton().click()
      const reasonForGovReferral = Page.verifyOnPage(ReasonForGovReferral)
      reasonForGovReferral.referralRadios().find('input[value="OTHER"]').check()
      reasonForGovReferral.referralReason().type('This is the reason for referring to the governor')
      reasonForGovReferral.submitButton().click()
      Page.verifyOnPage(HearingReferralConfirmation)
      cy.task('stubGetReportedAdjudication', {
        id: 101,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '101',
            prisonerNumber: 'G6415GD',
            outcomes: [
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2030-01-04T09:00:00',
                  id: 987,
                  locationId: 123,
                  oicHearingType: OicHearingType.GOV_ADULT,
                  outcome: testData.hearingOutcome({
                    code: HearingOutcomeCode.REFER_INAD,
                    adjudicator: 'JSMITH_GEN',
                    optionalItems: {
                      details: 'This is my reasoning',
                    },
                  }),
                }),
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.REFER_INAD,
                    details: 'This is my reasoning',
                  }),
                  referralOutcome: testData.referralOutcome({
                    code: ReferralOutcomeCode.REFER_GOV,
                    details: 'This is the reason for referring to the governor',
                  }),
                },
              },
            ],
            status: ReportedAdjudicationStatus.REFER_GOV,
          }),
        },
      })
      hearingReferralConfirmation.returnLink().click()
      hearingTabPage.nextStepReferralOutcomeButton().click()
      const nextStepsGovPage = Page.verifyOnPage(NextStepsGovPage)
      nextStepsGovPage.nextStepRadioButtons().find('input[value="schedule_hearing"]').click({ force: true })
      nextStepsGovPage.submitButton().click()
      const scheduleHearingsPage = Page.verifyOnPage(ScheduleHearingPage)
      scheduleHearingsPage.hearingTypeRadios().find('input[value="GOV"]').click({ force: true })
      scheduleHearingsPage.locationSelector().select('Houseblock 1')
      const date = formatDateForDatePicker(new Date('1/1/2030').toISOString(), 'short')
      scheduleHearingsPage.datePicker().type(date)
      scheduleHearingsPage.timeInputHours().select('11')
      scheduleHearingsPage.timeInputMinutes().select('05')
      cy.task('stubGetReportedAdjudication', {
        id: 101,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '101',
            prisonerNumber: 'G6415GD',
            outcomes: [
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2030-01-04T09:00:00',
                  id: 987,
                  locationId: 123,
                  oicHearingType: OicHearingType.GOV_ADULT,
                  outcome: testData.hearingOutcome({
                    code: HearingOutcomeCode.REFER_INAD,
                    adjudicator: 'JSMITH_GEN',
                    optionalItems: {
                      details: 'This is my reasoning',
                    },
                  }),
                }),
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.REFER_INAD,
                    details: 'This is my reasoning',
                  }),
                  referralOutcome: testData.referralOutcome({
                    code: ReferralOutcomeCode.REFER_GOV,
                    details: 'This is the reason for referring to the governor',
                    referGovReason: ReferGovReason.OTHER,
                  }),
                },
              },
              {
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.SCHEDULE_HEARING,
                  }),
                },
              },
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2030-01-04T09:00:00',
                  id: 987,
                  locationId: 123,
                  oicHearingType: OicHearingType.GOV_ADULT,
                }),
              },
            ] as OutcomeHistory,
            status: ReportedAdjudicationStatus.SCHEDULED,
          }),
        },
      })
      scheduleHearingsPage.submitButton().click()
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('4 January 2030 - 09:00')
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Governor')
          expect($summaryData.get(3).innerText).to.contain('T. User')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the independent adjudicator')
        })
      hearingTabPage.outcomeTableTitle().contains('Independent adjudicator referral')
      hearingTabPage
        .inAdReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Reason for referral')
          expect($summaryLabel.get(1).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .inAdReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reasoning')
          expect($summaryData.get(1).innerText).to.contain('Refer this case to a governor')
        })
      hearingTabPage.outcomeTableTitle().contains('Governor referral')
      hearingTabPage
        .govReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain('Why has this case been referred back to the governor?')
          expect($summaryLabel.get(1).innerText).to.contain('Adjudicator’s comments about the referral')
          expect($summaryLabel.get(2).innerText).to.contain('Outcome')
        })
      hearingTabPage
        .govReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Other')
          expect($summaryData.get(1).innerText).to.contain('This is the reason for referring to the governor')
          expect($summaryData.get(2).innerText).to.contain('Schedule a hearing')
        })
      hearingTabPage
        .hearingSummaryTable(2)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('4 January 2030 - 09:00')
          expect($summaryData.get(2).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(4).innerText).to.contain('Governor')
        })
    })
  })
})
