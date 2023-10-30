import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import CheckPunishments from '../pages/checkPunishments'
import ReasonForChangePunishmentPage from '../pages/reasonForChangePunishment'
import Page from '../pages/page'
import { PunishmentType } from '../../server/data/PunishmentResult'
import PunishmentPage from '../pages/punishment'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDays'
import PunishmentIsSuspendedPage from '../pages/punishmentIsSuspended'
import PunishmentStartDateChoicePage from '../pages/punishmentStartDateChoice'
import PunishmentSuspendedUntilPage from '../pages/punishmentSuspendedUntil'
import PunishmentAutomaticEndDatesPage from '../pages/punishmentAutomaticEndDates'
import AwardPunishmentsPage from '../pages/awardPunishments'
import PunishmentStartDatePage from '../pages/punishmentStartDate'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()

context('Check punishments', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetReportedAdjudication', {
      id: 123,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [],
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
      chargeNumber: 123,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [
            {
              id: 14,
              type: PunishmentType.CONFINEMENT,
              schedule: {
                days: 5,
                suspendedUntil: '2023-04-13',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 456,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '456',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
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
              schedule: {
                days: 5,
                suspendedUntil: '2023-04-13',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubAmendPunishments', {
      chargeNumber: 456,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '456',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [
            {
              id: 14,
              type: PunishmentType.CONFINEMENT,
              schedule: {
                days: 5,
                suspendedUntil: '2023-04-13',
              },
            },
            {
              id: 15,
              type: PunishmentType.EARNINGS,
              stoppagePercentage: 25,
              schedule: {
                startDate: '2023-04-13',
                endDate: '2023-04-15',
                days: 2,
              },
            },
          ],
        }),
      },
    })
    cy.task('stubCreatePunishmentComment', {
      chargeNumber: 456,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '456',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [
            {
              id: 14,
              type: PunishmentType.CONFINEMENT,
              schedule: {
                days: 5,
                suspendedUntil: '2023-04-13',
              },
            },
            {
              id: 15,
              type: PunishmentType.EARNINGS,
              stoppagePercentage: 25,
              schedule: {
                startDate: '2023-04-13',
                endDate: '2023-04-15',
                days: 2,
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({})],
        }),
      },
    })

    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements - nothing in session', () => {
      cy.visit(adjudicationUrls.checkPunishments.urls.start('123'))
      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)

      checkPunishmentsPage.emptyState().should('exist')
      checkPunishmentsPage.cancelLink().should('exist')
      checkPunishmentsPage.changePunishmentsLink().should('exist')
      checkPunishmentsPage.submitButton().should('not.exist')
      checkPunishmentsPage.punishmentsTable().should('not.exist')
      checkPunishmentsPage.reasonForChangeSummary().should('not.exist')
    })
    it('should go to award punishments page if change link is clicked', () => {
      cy.visit(adjudicationUrls.checkPunishments.urls.start('123'))
      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)
      checkPunishmentsPage.changePunishmentsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('123'))
      })
    })
    it('should go to hearings page if the cancel link is clicked', () => {
      cy.visit(adjudicationUrls.checkPunishments.urls.start('123'))
      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)
      checkPunishmentsPage.cancelLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('123'))
      })
    })
    it('should show the data in the session when punishments are present', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('123'))
      cy.get('[data-qa="add-new-punishment-button"]').click()

      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
      punishmentPage.submitButton().click()

      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('5')
      punishmentNumberOfDaysPage.submitButton().click()

      const punishmentSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentSuspendedPage.suspended().find('input[value="yes"]').check()
      punishmentSuspendedPage.submitButton().click()

      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      punishmentSuspendedUntilPage.suspendedUntil().type(date)
      punishmentSuspendedUntilPage.submitButton().click()

      cy.get('[data-qa="punishments-table"]')
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Cellular confinement')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
      cy.get('[data-qa="add-new-punishment-button"]').click()

      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      cy.get('#stoppagePercentage').type('25')
      punishmentPage.submitButton().click()

      punishmentNumberOfDaysPage.days().type('2')
      punishmentNumberOfDaysPage.submitButton().click()

      punishmentSuspendedPage.suspended().find('input[value="no"]').check()
      punishmentSuspendedPage.submitButton().click()

      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.radioButtons().find('input[value="true"]').check()
      punishmentStartDateChoicePage.submitButton().click()

      const punishmentAutomaticEndDatesPage = Page.verifyOnPage(PunishmentAutomaticEndDatesPage)
      punishmentAutomaticEndDatesPage.submitButton().click()

      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage.continue().click()

      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)
      checkPunishmentsPage.punishmentsTable().should('exist')
      checkPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Cellular confinement')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(5).innerText).to.contain('-')
          expect($summaryData.get(8).innerText).to.contain('Stoppage of earnings: 25%')
          expect($summaryData.get(9).innerText).to.contain('23 Nov 2024')
          expect($summaryData.get(10).innerText).to.contain('24 Nov 2024')
          expect($summaryData.get(11).innerText).to.contain('2')
          expect($summaryData.get(12).innerText).to.contain('-')
          expect($summaryData.get(13).innerText).to.contain('-')
        })
      checkPunishmentsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('123'))
      })
    })
    it('can submit edited punishments', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('456'))
      cy.get('[data-qa="add-new-punishment-button"]').click()
      cy.get('#punishmentType-3').click()
      cy.get('#stoppagePercentage').type('25')
      cy.get('[data-qa="punishment-submit"]').click()

      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('2')
      punishmentNumberOfDaysPage.submitButton().click()

      const punishmentSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentSuspendedPage.suspended().find('input[value="no"]').check()
      punishmentSuspendedPage.submitButton().click()

      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.radioButtons().find('input[value="false"]').check()
      punishmentStartDateChoicePage.submitButton().click()

      const punishmentStartDatePage = Page.verifyOnPage(PunishmentStartDatePage)
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      punishmentStartDatePage.datepicker().type(date)
      punishmentStartDatePage.submitButton().click()

      const punishmentAutomaticEndDatesPage = Page.verifyOnPage(PunishmentAutomaticEndDatesPage)
      punishmentAutomaticEndDatesPage.submitButton().click()

      cy.get('[data-qa="punishments-continue').click()
      const reasonForChangePunishmentPage: ReasonForChangePunishmentPage =
        Page.verifyOnPage(ReasonForChangePunishmentPage)
      reasonForChangePunishmentPage.radios().find('input[value="APPEAL"]').click()
      reasonForChangePunishmentPage.details().type('test text')
      reasonForChangePunishmentPage.submitButton().click()
      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)
      checkPunishmentsPage.punishmentsTable().should('exist')
      checkPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Cellular confinement')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('13 Apr 2023')
          expect($summaryData.get(5).innerText).to.contain('-')
          expect($summaryData.get(8).innerText).to.contain('Stoppage of earnings: 25%')
          expect($summaryData.get(9).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(10).innerText).to.contain('11 Oct 2030')
          expect($summaryData.get(11).innerText).to.contain('2')
          expect($summaryData.get(12).innerText).to.contain('-')
          expect($summaryData.get(13).innerText).to.contain('-')
        })
      checkPunishmentsPage.reasonForChangeSummary().should('exist')
      checkPunishmentsPage
        .reasonForChangeSummary()
        .find('dt')
        .then($title => {
          expect($title.get(0).innerText).to.contain('What is the reason for changing the punishments?')
        })
      checkPunishmentsPage
        .reasonForChangeSummary()
        .find('dd')
        .then($info => {
          expect($info.get(0).innerText).to.contain('The punishments have been changed after an appeal\n\ntest text')
        })
      checkPunishmentsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('456'))
      })
    })
  })
})
