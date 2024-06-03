import Page from '../pages/page'

import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { NotCompletedOutcome, PunishmentMeasurement, PunishmentType } from '../../server/data/PunishmentResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import CompleteRehabilitativeActivity from '../pages/completeRehabilitativeActivity'
import PunishmentsAndDamagesPage from '../pages/punishmentsAndDamages'
import IncompleteRehabilitativeActivity from '../pages/incompleteRehabilitativeActivity'
import { formatDateForDatePicker } from '../../server/utils/utils'
import RehabCheckYourAnswerssPage from '../pages/rehabCheckYourAnswers'

const testData = new TestData()
context('Mark whether a rehabilitative activity has been completed', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6123VU',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6123VU',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 110,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '110',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              id: 68,
            }),
          ],
          punishments: [
            {
              id: 1,
              type: PunishmentType.CONFINEMENT,
              rehabilitativeActivities: [{ details: 'details' }],
              canEdit: true,
              schedule: {
                duration: 10,
                measurement: PunishmentMeasurement.DAYS,
                suspendedUntil: '2024-11-23',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 111,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '111',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              id: 68,
            }),
          ],
          punishments: [
            {
              id: 1,
              type: PunishmentType.CONFINEMENT,
              rehabilitativeActivities: [{ details: 'details' }],
              canEdit: true,
              rehabilitativeActivitiesCompleted: true,
              schedule: {
                duration: 10,
                measurement: PunishmentMeasurement.DAYS,
                suspendedUntil: '2024-11-23',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 112,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '112',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          punishments: [
            {
              id: 1,
              type: PunishmentType.CONFINEMENT,
              rehabilitativeActivities: [{ details: 'details' }],
              canEdit: true,
              rehabilitativeActivitiesCompleted: false,
              rehabilitativeActivitiesNotCompletedOutcome: NotCompletedOutcome.EXT_SUSPEND,
              schedule: {
                duration: 7,
                measurement: PunishmentMeasurement.DAYS,
                suspendedUntil: '2024-11-23',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 113,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '113',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          punishments: [
            {
              id: 1,
              type: PunishmentType.CONFINEMENT,
              rehabilitativeActivities: [{ details: 'details' }],
              canEdit: true,
              rehabilitativeActivitiesCompleted: false,
              rehabilitativeActivitiesNotCompletedOutcome: NotCompletedOutcome.PARTIAL_ACTIVATE,
              schedule: {
                duration: 7,
                measurement: PunishmentMeasurement.DAYS,
                suspendedUntil: '2024-11-23',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubCompleteRehabActivity', {
      chargeNumber: '110',
      punishmentId: 1,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '110',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              id: 68,
            }),
          ],
          punishments: [
            {
              id: 1,
              type: PunishmentType.CONFINEMENT,
              rehabilitativeActivities: [{ details: 'details' }],
              canEdit: true,
              rehabilitativeActivitiesCompleted: true,
              schedule: {
                duration: 10,
                measurement: PunishmentMeasurement.DAYS,
                suspendedUntil: '2024-11-23',
              },
            },
          ],
        }),
      },
    })
    cy.signIn()
  })
  describe('Activity completed', () => {
    it('Validation', () => {
      cy.visit(adjudicationUrls.completeRehabilitativeActivity.urls.start('110', 1))

      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.submitButton().click()
      completeActivityPage.errorSummary().contains('Select yes if John Smith completed the activity')
    })
    it('Edit mode - should have completed pre-filled', () => {
      cy.visit(adjudicationUrls.completeRehabilitativeActivity.urls.start('111', 1))

      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="YES"]').click()
      completeActivityPage.submitButton().click()
      const checkYourAnswers = Page.verifyOnPage(RehabCheckYourAnswerssPage)
      checkYourAnswers.completedChangeLink().last().click()

      completeActivityPage.completedChoice().find('input[value="YES"]').should('be.checked')
    })
    it('Should submit YES answer', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('110'))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.rehabActivitiesTable().should('exist')
      cy.get('[data-qa="completed-activity"]').click()
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="YES"]').click()
      cy.task('stubGetReportedAdjudication', {
        id: 110,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '110',
            prisonerNumber: 'G6123VU',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
            punishments: [
              {
                id: 1,
                type: PunishmentType.CONFINEMENT,
                rehabilitativeActivities: [{ details: 'details' }],
                canEdit: true,
                rehabilitativeActivitiesCompleted: true,
                schedule: {
                  duration: 10,
                  measurement: PunishmentMeasurement.DAYS,
                  suspendedUntil: '2024-11-23',
                },
              },
            ],
          }),
        },
      })
      completeActivityPage.submitButton().click()

      const checkYourAnswers = Page.verifyOnPage(RehabCheckYourAnswerssPage)
      checkYourAnswers.submitButton().click()

      Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .rehabActivitiesTable()
        .find('td')
        .then($data => {
          expect($data.get(4).innerText).to.contains('Yes')
        })

      punishmentsAndDamagesPage
        .awardPunishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(4).innerText).to.not.contain('- with a rehabilitative activity condition')
        })
    })
  })
  describe('Not completed', () => {
    it('Validation', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('110'))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.rehabActivitiesTable().should('exist')
      cy.get('[data-qa="completed-activity"]').click()
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)
      incompleteRehabilitativeActivityPage.submitButton().click()
      completeActivityPage.errorSummary().contains('Select what happens to John Smith’s suspended punishment')
    })
    it('Full activation', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('110'))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.rehabActivitiesTable().should('exist')
      cy.get('[data-qa="completed-activity"]').click()
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)
      incompleteRehabilitativeActivityPage.radios().find('input[value="FULL_ACTIVATE"]').click()
      cy.task('stubGetReportedAdjudication', {
        id: 110,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '110',
            prisonerNumber: 'G6123VU',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
            punishments: [
              {
                id: 1,
                type: PunishmentType.CONFINEMENT,
                rehabilitativeActivities: [{ details: 'details' }],
                canEdit: true,
                rehabilitativeActivitiesCompleted: false,
                rehabilitativeActivitiesNotCompletedOutcome: NotCompletedOutcome.FULL_ACTIVATE,
                schedule: {
                  duration: 10,
                  measurement: PunishmentMeasurement.DAYS,
                  suspendedUntil: '2024-11-23',
                },
              },
            ],
          }),
        },
      })
      incompleteRehabilitativeActivityPage.submitButton().click()
      const checkYourAnswers = Page.verifyOnPage(RehabCheckYourAnswerssPage)
      checkYourAnswers.submitButton().click()

      Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .rehabActivitiesTable()
        .find('td')
        .then($data => {
          expect($data.get(4).innerText).to.contains('No - suspended punishment activated')
        })

      punishmentsAndDamagesPage
        .awardPunishmentsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contains(
            '(activated after a breach of a rehabilitative activity condition)'
          )
        })
    })
    it('Validation 2', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('110'))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.rehabActivitiesTable().should('exist')
      cy.get('[data-qa="completed-activity"]').click()
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)
      incompleteRehabilitativeActivityPage.radios().find('input[value="PARTIAL_ACTIVATE"]').click()
      incompleteRehabilitativeActivityPage.submitButton().click()
      completeActivityPage.errorSummary().contains('Enter the number of days for the punishment')
    })
    it('Partial activation', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('110'))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.rehabActivitiesTable().should('exist')
      cy.get('[data-qa="completed-activity"]').click()
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)
      incompleteRehabilitativeActivityPage.radios().find('input[value="PARTIAL_ACTIVATE"]').click()
      incompleteRehabilitativeActivityPage.daysToActivate().type('4')
      cy.task('stubGetReportedAdjudication', {
        id: 110,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '110',
            prisonerNumber: 'G6123VU',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
            punishments: [
              {
                id: 1,
                type: PunishmentType.CONFINEMENT,
                rehabilitativeActivities: [{ details: 'details' }],
                canEdit: true,
                rehabilitativeActivitiesCompleted: false,
                rehabilitativeActivitiesNotCompletedOutcome: NotCompletedOutcome.PARTIAL_ACTIVATE,
                schedule: {
                  duration: 4,
                  measurement: PunishmentMeasurement.DAYS,
                  suspendedUntil: '2024-11-23',
                },
              },
            ],
          }),
        },
      })
      incompleteRehabilitativeActivityPage.submitButton().click()
      const checkYourAnswers = Page.verifyOnPage(RehabCheckYourAnswerssPage)
      checkYourAnswers.submitButton().click()
      Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .rehabActivitiesTable()
        .find('td')
        .then($data => {
          expect($data.get(4).innerText).to.contains('No - part of the suspended punishment activated')
        })
      punishmentsAndDamagesPage
        .awardPunishmentsTable()
        .find('td')
        .then($data => {
          expect($data.get(0).innerText).to.contains(
            '(activated after a breach of a rehabilitative activity condition)'
          )
        })
    })
    it('Validation 3', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('110'))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.rehabActivitiesTable().should('exist')
      cy.get('[data-qa="completed-activity"]').click()
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)
      incompleteRehabilitativeActivityPage.radios().find('input[value="EXT_SUSPEND"]').click()
      incompleteRehabilitativeActivityPage.submitButton().click()
      completeActivityPage.errorSummary().contains('Enter the new date the suspended punishment will end')
    })
    it('Extend suspended', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('110'))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.rehabActivitiesTable().should('exist')
      cy.get('[data-qa="completed-activity"]').click()
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)
      incompleteRehabilitativeActivityPage.radios().find('input[value="EXT_SUSPEND"]').click()
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      incompleteRehabilitativeActivityPage.suspendedUntil().type(date)

      cy.task('stubGetReportedAdjudication', {
        id: 110,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '110',
            prisonerNumber: 'G6123VU',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
            punishments: [
              {
                id: 1,
                type: PunishmentType.CONFINEMENT,
                rehabilitativeActivities: [{ details: 'details' }],
                canEdit: true,
                rehabilitativeActivitiesCompleted: false,
                previousSuspendedUntilDate: '2030-10-01',
                rehabilitativeActivitiesNotCompletedOutcome: NotCompletedOutcome.EXT_SUSPEND,
                schedule: {
                  duration: 4,
                  measurement: PunishmentMeasurement.DAYS,
                  suspendedUntil: '2030-10-10',
                },
              },
            ],
          }),
        },
      })
      incompleteRehabilitativeActivityPage.submitButton().click()
      const checkYourAnswers = Page.verifyOnPage(RehabCheckYourAnswerssPage)
      checkYourAnswers.submitButton().click()

      Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .rehabActivitiesTable()
        .find('td')
        .then($data => {
          expect($data.get(4).innerText).to.contains('No - suspension end date extended')
        })
      punishmentsAndDamagesPage
        .awardPunishmentsTable()
        .find('td')
        .then($data => {
          expect($data.get(4).innerText).to.contains('(extended from 1 Oct 2030')
        })
    })
    it('No action', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review('110'))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.rehabActivitiesTable().should('exist')
      cy.get('[data-qa="completed-activity"]').click()
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)
      incompleteRehabilitativeActivityPage.radios().find('input[value="NO_ACTION"]').click()
      cy.task('stubGetReportedAdjudication', {
        id: 110,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '110',
            prisonerNumber: 'G6123VU',
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
            punishments: [
              {
                id: 1,
                type: PunishmentType.CONFINEMENT,
                rehabilitativeActivities: [{ details: 'details' }],
                canEdit: true,
                rehabilitativeActivitiesCompleted: false,
                rehabilitativeActivitiesNotCompletedOutcome: NotCompletedOutcome.NO_ACTION,
                schedule: {
                  duration: 10,
                  measurement: PunishmentMeasurement.DAYS,
                  suspendedUntil: '2024-11-23',
                },
              },
            ],
          }),
        },
      })
      incompleteRehabilitativeActivityPage.submitButton().click()
      const checkYourAnswers = Page.verifyOnPage(RehabCheckYourAnswerssPage)
      checkYourAnswers.submitButton().click()
      Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .rehabActivitiesTable()
        .find('td')
        .then($data => {
          expect($data.get(4).innerText).to.contains('No - no further action')
        })
    })
    it('Edit - date', () => {
      cy.visit(adjudicationUrls.completeRehabilitativeActivity.urls.start('112', 1))
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)
      incompleteRehabilitativeActivityPage.radios().find('input[value="EXT_SUSPEND"]').click()
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      incompleteRehabilitativeActivityPage.suspendedUntil().type(date)
      incompleteRehabilitativeActivityPage.submitButton().click()
      const checkYourAnswers = Page.verifyOnPage(RehabCheckYourAnswerssPage)
      checkYourAnswers.outcomeChangeLink().last().click()
      incompleteRehabilitativeActivityPage.radios().find('input[value=EXT_SUSPEND]')
      incompleteRehabilitativeActivityPage.suspendedUntil().should('contain.value', '10/10/2030')
    })
    it('Edit - days', () => {
      cy.visit(adjudicationUrls.completeRehabilitativeActivity.urls.start('112', 1))
      const completeActivityPage = Page.verifyOnPage(CompleteRehabilitativeActivity)
      completeActivityPage.completedChoice().find('input[value="NO"]').click()
      completeActivityPage.submitButton().click()
      const incompleteRehabilitativeActivityPage = Page.verifyOnPage(IncompleteRehabilitativeActivity)

      incompleteRehabilitativeActivityPage.radios().find('input[value="PARTIAL_ACTIVATE"]').click()
      incompleteRehabilitativeActivityPage.daysToActivate().type('4')
      incompleteRehabilitativeActivityPage.submitButton().click()

      const checkYourAnswers = Page.verifyOnPage(RehabCheckYourAnswerssPage)
      checkYourAnswers.outcomeChangeLink().last().click()
      incompleteRehabilitativeActivityPage.radios().find('input[value=PARTIAL_ACTIVATE]')
      incompleteRehabilitativeActivityPage.daysToActivate().should('contain.value', '4')
    })
  })
})
