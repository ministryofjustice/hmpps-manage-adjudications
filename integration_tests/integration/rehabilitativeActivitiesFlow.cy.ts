import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentPage from '../pages/punishment'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PunishmentMeasurement, PunishmentType } from '../../server/data/PunishmentResult'
import PunishmentSuspendedUntilPage from '../pages/punishmentSuspendedUntil'
import { formatDateForDatePicker } from '../../server/utils/utils'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDays'
import PunishmentIsSuspendedPage from '../pages/punishmentIsSuspended'
import IsThereRehabilitativeActivitesPage from '../pages/isThereRehabilitativeActivitiesPage'
import HasRehabilitativeActivitesDetailsPage from '../pages/hasRehabilitativeActivitiesDetailsPage'

const testData = new TestData()
context.skip('Add a rehabilitative activity', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
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
  describe('Add a rehabilitative activity with no information', () => {
    it('should ask the user if a condition is associated', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
      punishmentPage.submitButton().click()

      const numberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      numberOfDaysPage.days().type('10')
      numberOfDaysPage.submitButton().click()

      const willPunishmentBeSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      willPunishmentBeSuspendedPage.suspended().find('input[value="yes"]').click()
      willPunishmentBeSuspendedPage.submitButton().click()

      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      punishmentSuspendedUntilPage.suspendedUntil().type(date)
      punishmentSuspendedUntilPage.submitButton().click()

      const isTherePage = Page.verifyOnPage(IsThereRehabilitativeActivitesPage)
      isTherePage.submitButton().click()
      isTherePage.errorSummary().contains('Select yes if there is a rehabilitative activity condition')

      isTherePage.rehabChoice().find('input[value="YES"]').click()
      isTherePage.submitButton().click()

      isTherePage.errorSummary().contains('Enter the number of rehabilitative activities')
      isTherePage.numberOfActivities().type('10')
      isTherePage.submitButton().click()

      const hasPage = Page.verifyOnPage(HasRehabilitativeActivitesDetailsPage)
      hasPage.submitButton().click()
      hasPage.errorSummary().contains('Select yes if you have the details of the rehabilitative activity')

      hasPage.detailsChoice().find('input[value="YES"]').click()
      hasPage.submitButton().click()

      // TODO should check the page has the relevant - with rehab activity
    })
  })
})