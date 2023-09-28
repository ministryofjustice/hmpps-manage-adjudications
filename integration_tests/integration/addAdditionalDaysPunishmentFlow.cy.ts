import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDaysAdditionalDays'
import AwardPunishmentsPage from '../pages/awardPunishments'
import PunishmentPage from '../pages/punishment'
import WillPunishmentBeSuspendedPage from '../pages/willPunishmentBeSuspended'
import suspendedUntilPage from '../pages/punishmentSuspendedUntil'
import { forceDateInput } from '../componentDrivers/dateInput'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context.skip('Add additional days punishments', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })

    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-09-02T10:50:00.000Z',
            }),
            testData.singleHearing({
              dateTimeOfHearing: '2023-09-03T12:00:00.000Z',
              oicHearingType: OicHearingType.INAD_ADULT,
            }),
          ],
          punishments: [
            {
              id: 71,
              type: PunishmentType.PRIVILEGE,
              privilegeType: PrivilegeType.MONEY,
              schedule: {
                days: 5,
                suspendedUntil: '2023-04-29',
              },
            },
          ],
        }),
      },
    })

    cy.signIn()
  })
  describe('Add additional days punishment', () => {
    it('Additional days', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsTablePage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsTablePage.newPunishment().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishment.urls.start('100'))
      })
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="ADDITIONAL_DAYS"]').check()
      punishmentPage.submitButton().click()

      const numberOfAdditionalDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      numberOfAdditionalDaysPage.days().type('10')
      numberOfAdditionalDaysPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isPunishmentSuspendedAdditionalDays_v1.urls.start('100'))
      })

      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.suspended().find('input[value="yes"]').click()
      willPunishmentBeSuspendedPage.submitButton().click()

      const punishmentSuspendedUntilPage = Page.verifyOnPage(suspendedUntilPage)
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')
      punishmentSuspendedUntilPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })

      awardPunishmentsTablePage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(8).innerText).to.contain('Additional days')
          expect($summaryData.get(9).innerText).to.contain('-')
          expect($summaryData.get(10).innerText).to.contain('-')
          expect($summaryData.get(11).innerText).to.contain('10')
          expect($summaryData.get(12).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(13).innerText).to.contain('-')
        })
    })
  })
})
