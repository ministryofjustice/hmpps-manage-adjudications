import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentPage from '../pages/punishment'
import PaybackPunishmentSpecifics from '../pages/paybackPunishmentSpecifics'
import AwardedPunishments from '../pages/awardPunishments'
import PaybackPunishmentDurationPage from '../pages/paybackPunishmentDuration'
import PaybackPunishmentCompletionDatePage from '../pages/paybackPunishmentCompletionDate'
import PaybackPunishmentDetailsPage from '../pages/paybackPunishmentDetails'
import PaybackPunishmentSchedulePage from '../pages/paybackPunishmentSchedule'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PunishmentMeasurement, PunishmentType } from '../../server/data/PunishmentResult'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()
context.skip('Add a new payback punishment', () => {
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
            type: PunishmentType.PAYBACK,
            schedule: {
              duration: null,
              measurement: PunishmentMeasurement.HOURS,
              startDate: null,
              lastDay: null,
            },
          },
        ],
      },
    })
    cy.signIn()
  })
  describe('Add a payback punishment with no information', () => {
    it('should add the payback punishment to the session and display correctly on the table on the awards page', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="PAYBACK"]').check()
      punishmentPage.submitButton().click()
      const paybackPunishmentSpecifics = Page.verifyOnPage(PaybackPunishmentSpecifics)
      paybackPunishmentSpecifics.punishmentSpecifics().find('input[value="NO"]').check()
      paybackPunishmentSpecifics.submitButton().click()
      const awardedPunishments = Page.verifyOnPage(AwardedPunishments)
      awardedPunishments
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Payback punishment')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('Not entered')
          expect($summaryData.get(3).innerText).to.contain('Not entered')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
    })
  })
  describe('Add a new payback punishment with information', () => {
    it('should follow the correct flow and display the information correctly in the awards page table - multiple hours', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="PAYBACK"]').check()
      punishmentPage.submitButton().click()
      const paybackPunishmentSpecifics = Page.verifyOnPage(PaybackPunishmentSpecifics)
      paybackPunishmentSpecifics.punishmentSpecifics().find('input[value="YES"]').check()
      paybackPunishmentSpecifics.submitButton().click()
      const paybackPunishmentDuration = Page.verifyOnPage(PaybackPunishmentDurationPage)
      paybackPunishmentDuration.durationInput().type('5')
      paybackPunishmentDuration.submitButton().click()
      const paybackPunishmentCompletionDate = Page.verifyOnPage(PaybackPunishmentCompletionDatePage)
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      paybackPunishmentCompletionDate.dateInput().type(date)
      paybackPunishmentCompletionDate.submitButton().click()
      const paybackPunishmentDetails = Page.verifyOnPage(PaybackPunishmentDetailsPage)
      paybackPunishmentDetails.details().type('These are the details for this payback punishment')
      paybackPunishmentDetails.submitButton().click()
      const paybackPunishmentSchedule = Page.verifyOnPage(PaybackPunishmentSchedulePage)
      paybackPunishmentSchedule
        .summary()
        .find('dt')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Number of hours')
          expect($summaryData.get(1).innerText).to.contain('Complete by')
          expect($summaryData.get(2).innerText).to.contain('Details')
        })
      paybackPunishmentSchedule
        .summary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('5')
          expect($summaryData.get(2).innerText).to.contain('10 October 2030')
          expect($summaryData.get(4).innerText).to.contain('These are the details for this payback punishment')
        })
      paybackPunishmentSchedule.continue().click()
      const awardedPunishments = Page.verifyOnPage(AwardedPunishments)
      awardedPunishments
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Payback punishment')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(3).innerText).to.contain('5 hours')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
    })
    it('should follow the correct flow and display the information correctly in the awards page table - single hour', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="PAYBACK"]').check()
      punishmentPage.submitButton().click()
      const paybackPunishmentSpecifics = Page.verifyOnPage(PaybackPunishmentSpecifics)
      paybackPunishmentSpecifics.punishmentSpecifics().find('input[value="YES"]').check()
      paybackPunishmentSpecifics.submitButton().click()
      const paybackPunishmentDuration = Page.verifyOnPage(PaybackPunishmentDurationPage)
      paybackPunishmentDuration.durationInput().type('1')
      paybackPunishmentDuration.submitButton().click()
      const paybackPunishmentCompletionDate = Page.verifyOnPage(PaybackPunishmentCompletionDatePage)
      const date = formatDateForDatePicker(new Date('01/01/2028').toISOString(), 'short')
      paybackPunishmentCompletionDate.dateInput().type(date)
      paybackPunishmentCompletionDate.submitButton().click()
      const paybackPunishmentDetails = Page.verifyOnPage(PaybackPunishmentDetailsPage)
      paybackPunishmentDetails.details().type('These are the details for this payback punishment')
      paybackPunishmentDetails.submitButton().click()
      const paybackPunishmentSchedule = Page.verifyOnPage(PaybackPunishmentSchedulePage)
      paybackPunishmentSchedule
        .summary()
        .find('dt')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Number of hours')
          expect($summaryData.get(1).innerText).to.contain('Complete by')
          expect($summaryData.get(2).innerText).to.contain('Details')
        })
      paybackPunishmentSchedule
        .summary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('1')
          expect($summaryData.get(2).innerText).to.contain('1 January 2028')
          expect($summaryData.get(4).innerText).to.contain('These are the details for this payback punishment')
        })
      paybackPunishmentSchedule.continue().click()
      const awardedPunishments = Page.verifyOnPage(AwardedPunishments)
      awardedPunishments
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Payback punishment')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('1 Jan 2028')
          expect($summaryData.get(3).innerText).to.contain('1 hour')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
    })
  })
})
