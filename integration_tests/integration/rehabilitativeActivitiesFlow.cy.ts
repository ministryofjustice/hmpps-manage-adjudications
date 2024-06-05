import Page from '../pages/page'

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

      isTherePage.numberOfActivities().type('q')
      isTherePage.submitButton().click()
      isTherePage.errorSummary().contains('The total number of rehabilitative activities must be a number')

      isTherePage.numberOfActivities().type('10')
      isTherePage.submitButton().click()

      const hasPage = Page.verifyOnPage(HasRehabilitativeActivitesDetailsPage)
      hasPage.submitButton().click()
      hasPage.errorSummary().contains('Select yes if you have the details of the rehabilitative activity')

      hasPage.detailsChoice().find('input[value="NO"]').click()
      hasPage.submitButton().click()

      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(4).innerText).to.contain('- with a rehabilitative activity condition')
        })

      awardPunishmentsPage
        .activitiesTable()
        .find('tr')
        .then(row => {
          expect(row.length).to.eq(11)
        })

      awardPunishmentsPage.editPunishment().first().click()
      punishmentPage.submitButton().click()
      numberOfDaysPage.submitButton().click()
      willPunishmentBeSuspendedPage.submitButton().click()
      punishmentSuspendedUntilPage.submitButton().click()
      isTherePage.rehabChoice().find('input[value="YES"]').should('be.checked')
      isTherePage.numberOfActivities().should('have.value', '10')
      isTherePage.submitButton().click()
      hasPage.detailsChoice().find('input[value="NO"]').should('be.checked')
      hasPage.submitButton().click()
      awardPunishmentsPage.removeActivity().first().click()
      const removeActivityPage = Page.verifyOnPage(RemoveActivityPage)
      removeActivityPage.submitButton().click()

      awardPunishmentsPage
        .activitiesTable()
        .find('tr')
        .then(row => {
          expect(row.length).to.eq(10)
        })
    })
    it('adds a rehab activity with information available - one activity', () => {
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
      isTherePage.rehabChoice().find('input[value="YES"]').click()
      isTherePage.numberOfActivities().type('1')
      isTherePage.submitButton().click()

      const hasPage = Page.verifyOnPage(HasRehabilitativeActivitesDetailsPage)
      hasPage.detailsChoice().find('input[value="YES"]').click()
      hasPage.submitButton().click()

      const activityDetails = Page.verifyOnPage(RehabilitativeActivityDetailsPage)
      activityDetails.submitButton().click()
      activityDetails.errorSummary().contains('Enter the activity John Smith will be doing')

      activityDetails.activityDescription().type('This is the activity description')
      activityDetails.submitButton().click()
      activityDetails.errorSummary().contains('Enter who is monitoring John Smith on the activity')

      activityDetails.monitorName().type('Fred Jones')
      activityDetails.submitButton().click()
      activityDetails.errorSummary().contains('Enter when the activity should be completed by')

      const activityDate = formatDateForDatePicker(new Date('01/10/2030').toISOString(), 'short')
      activityDetails.endDate().type(activityDate)

      activityDetails.numberOfSessions().type('4')
      activityDetails.submitButton().click()

      const awardedPunishments = Page.verifyOnPage(AwardPunishmentsPage)
      awardedPunishments
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Cellular confinement')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('10')
          expect($summaryData.get(4).innerText).to.contain('10 Oct 2030 - with a rehabilitative activity condition')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
    })
    it('adds a rehab activity with information available - two activities', () => {
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
      isTherePage.rehabChoice().find('input[value="YES"]').click()
      isTherePage.numberOfActivities().type('2')
      isTherePage.submitButton().click()

      const hasPage = Page.verifyOnPage(HasRehabilitativeActivitesDetailsPage)
      hasPage.detailsChoice().find('input[value="YES"]').click()
      hasPage.submitButton().click()

      const activityDetailsFirst = Page.verifyOnPage(RehabilitativeActivityDetailsPage)
      activityDetailsFirst
        .fullTitle()
        .should('contain.text', 'Add details of the first rehabilitative activity: 1 of 2')
      activityDetailsFirst.activityDescription().type('This is the activity description')
      activityDetailsFirst.monitorName().type('Fred Jones')
      const activityDate = formatDateForDatePicker(new Date('01/10/2030').toISOString(), 'short')
      activityDetailsFirst.endDate().type(activityDate)
      activityDetailsFirst.submitButton().click()

      const activityDetailsSecond = Page.verifyOnPage(RehabilitativeActivityDetailsPage)
      activityDetailsSecond
        .fullTitle()
        .should('contain.text', 'Add details of the second rehabilitative activity: 2 of 2')
      activityDetailsSecond.activityDescription().type('This is the second activity description')
      activityDetailsSecond.monitorName().type('Tania Jones')
      const secondActivityDate = formatDateForDatePicker(new Date('06/10/2030').toISOString(), 'short')
      activityDetailsSecond.endDate().type(secondActivityDate)
      activityDetailsSecond.submitButton().click()

      const awardedPunishments = Page.verifyOnPage(AwardPunishmentsPage)
      awardedPunishments
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Cellular confinement')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('10')
          expect($summaryData.get(4).innerText).to.contain('10 Oct 2030 - with a rehabilitative activity condition')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
      awardedPunishments.removeActivity().first().click()
      const removeActivityPage = Page.verifyOnPage(RemoveActivityPage)
      removeActivityPage.submitButton().click()
      awardedPunishments
        .activitiesTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(3).innerText).to.contain('T. Jones')
        })
      awardedPunishments.changeActivity().first().click()
      const activityDetailsEdit = Page.verifyOnPage(RehabilitativeActivityDetailsPage)
      activityDetailsEdit.monitorName().clear()
      activityDetailsEdit.monitorName().type('Obi One')
      activityDetailsEdit.submitButton().click()
      awardedPunishments
        .activitiesTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(3).innerText).to.contain('O. One')
        })
    })
    describe('Edit mode and session population', () => {
      it('it should set Rehab activities to No, and leave do you have details blank when switching to Yes', () => {
        cy.visit(adjudicationUrls.awardPunishments.urls.start('101'))
        const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
        awardPunishmentsPage.editPunishment().first().click()

        const punishmentPage = Page.verifyOnPage(PunishmentPage)
        punishmentPage.submitButton().click()

        const numberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
        numberOfDaysPage.submitButton().click()

        const willPunishmentBeSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
        willPunishmentBeSuspendedPage.submitButton().click()

        const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
        punishmentSuspendedUntilPage.submitButton().click()

        const isTherePage = Page.verifyOnPage(IsThereRehabilitativeActivitesPage)
        isTherePage.rehabChoice().find('input[value="NO"]').should('be.checked')
        isTherePage.rehabChoice().find('input[value="YES"]').click()
        isTherePage.numberOfActivities().type('10')
        isTherePage.submitButton().click()

        const hasPage = Page.verifyOnPage(HasRehabilitativeActivitesDetailsPage)

        hasPage.detailsChoice().find('input[value="NO"]').should('not.be.checked')
        hasPage.detailsChoice().find('input[value="YES"]').should('not.be.checked')
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
