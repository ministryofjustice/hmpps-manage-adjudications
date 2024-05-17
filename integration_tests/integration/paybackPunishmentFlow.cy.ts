import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentPage from '../pages/punishment'
import PaybackPunishmentSpecifics from '../pages/paybackPunishmentSpecifics'
import AwardedPunishments from '../pages/awardPunishments'
import CheckPunishments from '../pages/checkPunishments'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PunishmentMeasurement, PunishmentType } from '../../server/data/PunishmentResult'

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
    it('should contain the required page elements', () => {
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
          expect($summaryData.get(1).innerText).to.contain('Not entered')
          expect($summaryData.get(2).innerText).to.contain('Not entered')
          expect($summaryData.get(3).innerText).to.contain('Not entered')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
      awardedPunishments.continue().click()
      const checkPunishments = Page.verifyOnPage(CheckPunishments)
      checkPunishments.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('100'))
      })
    })
  })
})
