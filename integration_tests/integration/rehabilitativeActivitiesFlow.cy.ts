import Page from '../pages/page'

import TestData from '../../server/routes/testutils/testData'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PunishmentMeasurement, PunishmentType } from '../../server/data/PunishmentResult'
import RehabilitativeActivityDetailsPage from '../pages/rehabilitativeActivityDetails'
import AwardPunishmentsPage from '../pages/awardPunishments'
import adjudicationUrls from '../../server/utils/urlGenerator'
import RemoveActivityPage from '../pages/removeActivityPage'

const testData = new TestData()
context('Add a rehabilitative activity', () => {
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
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              id: 68,
            }),
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
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
              id: 14,
              type: PunishmentType.CONFINEMENT,
              rehabilitativeActivities: [],
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
      id: 102,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '102',
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
              id: 14,
              type: PunishmentType.CONFINEMENT,
              rehabilitativeActivities: [{}],
              canEdit: true,
              rehabilitativeActivitiesCompleted: false,
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
              rehabilitativeActivities: [
                { id: 1, details: 'Victim awareness course', monitor: 'Ann Smith', endDate: '2024-11-10' },
                { id: 2, details: 'Gym sessions', monitor: 'Jo Brown', endDate: '2024-11-20', totalSessions: 4 },
              ],
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
    cy.task('stubCreatePunishments', {
      chargeNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6123VU',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2024-11-23T17:00:00',
              id: 68,
            }),
          ],
        }),
        punishments: [
          {
            id: 14,
            type: PunishmentType.CONFINEMENT,
            rehabilitativeActivities: [{ id: 1 }],
            canEdit: false,
            schedule: {
              duration: 10,
              measurement: PunishmentMeasurement.DAYS,
              startDate: null,
              lastDay: null,
              suspendedUntil: '2024-11-23',
            },
          },
        ],
      },
    })
    cy.signIn()
  })
  describe('Rehabilitative activities on the award punishments page', () => {
    describe('Saved charges', () => {
      it('changes or removes only the chosen activity on a saved charge', () => {
        cy.visit(adjudicationUrls.awardPunishments.urls.start('112'))
        const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
        awardPunishmentsPage.activitiesTable().find('tbody tr').should('have.length', 2)

        // Change on the second activity opens that activity
        awardPunishmentsPage.changeActivity().eq(1).click()
        const activityDetails = Page.verifyOnPage(RehabilitativeActivityDetailsPage)
        activityDetails.activityDescription().should('have.value', 'Gym sessions')
        activityDetails.monitorName().should('have.value', 'Jo Brown')
        cy.go('back')

        // Remove on the second activity removes only that one
        Page.verifyOnPage(AwardPunishmentsPage).removeActivity().eq(1).click()
        Page.verifyOnPage(RemoveActivityPage).submitButton().click()
        const afterRemoval = Page.verifyOnPage(AwardPunishmentsPage)
        afterRemoval.activitiesTable().find('tbody tr').should('have.length', 1)
        afterRemoval.activitiesTable().should('contain', 'Victim awareness course').and('not.contain', 'Gym sessions')
      })
      it('change and remove links should be disabled if the condition has a completed value set', () => {
        cy.visit(adjudicationUrls.awardPunishments.urls.start('102'))
        const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

        awardPunishmentsPage
          .activitiesTable()
          .find('td')
          .then($summaryData => {
            expect($summaryData.get(4).innerText).to.contain('')
            expect($summaryData.get(5).innerText).to.contain('')
          })
      })
    })
  })
})
