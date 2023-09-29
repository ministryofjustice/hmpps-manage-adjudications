import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentAutomaticEndDatesPage from '../pages/punishmentAutomaticEndDates'
import AwardPunishmentsPage from '../pages/awardPunishments'
import PunishmentPage from '../pages/punishment'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDays'
import PunishmentIsSuspendedPage from '../pages/punishmentIsSuspended'
import PunishmentStartDateChoicePage from '../pages/punishmentStartDateChoice'
import PunishmentStartDatePage from '../pages/punishmentStartDate'
import { forceDateInput } from '../componentDrivers/dateInput'

const testData = new TestData()
context('Punishment - Punishment schedule', () => {
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
      id: 100,
      response: {
        reportedAdjudication: {
          ...testData.reportedAdjudication({
            punishments: [],
            chargeNumber: '100',
            prisonerNumber: 'G6415GD',
            locationId: 25538,
            offenceDetails: { offenceCode: 1001 },
            hearings: [
              testData.singleHearing({
                dateTimeOfHearing: '2030-11-23T17:00:00',
                id: 68,
              }),
            ],
          }),
        },
      },
    })
    cy.signIn()
  })

  describe('displays the correct information', () => {
    it('End to end punishments to auto end date page - starts immediately', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.stoppagePercentage().type('10')
      punishmentPage.submitButton().click()
      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('10')
      punishmentNumberOfDaysPage.submitButton().click()
      const punishmentIsSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentIsSuspendedPage.suspended().find('input[value="no"]').check()
      punishmentIsSuspendedPage.submitButton().click()
      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.radioButtons().find('input[value="true"]').check()
      punishmentStartDateChoicePage.submitButton().click()
      const punishmentAutomaticEndDatesPage = Page.verifyOnPage(PunishmentAutomaticEndDatesPage)
      punishmentAutomaticEndDatesPage.name().contains('Stoppage of earnings: 10%')
      punishmentAutomaticEndDatesPage
        .summary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Start date')
          expect($summaryLabels.get(1).innerText).to.contain('Number of days')
          expect($summaryLabels.get(2).innerText).to.contain('Last day')
        })
      punishmentAutomaticEndDatesPage
        .summary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('23 Nov 2030')
          expect($summaryData.get(2).innerText).to.contain('10')
          expect($summaryData.get(4).innerText).to.contain('2 Dec 2030')
        })
    })
    it('End to end punishments to auto end date page - starts in future', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="REMOVAL_WING"]').check()
      punishmentPage.submitButton().click()
      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('10')
      punishmentNumberOfDaysPage.submitButton().click()
      const punishmentIsSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentIsSuspendedPage.suspended().find('input[value="no"]').check()
      punishmentIsSuspendedPage.submitButton().click()
      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.radioButtons().find('input[value="false"]').check()
      punishmentStartDateChoicePage.submitButton().click()
      const punishmentStartDatePage = Page.verifyOnPage(PunishmentStartDatePage)
      forceDateInput(30, 12, 2030, '[data-qa="punishment-start-date-picker"]')
      punishmentStartDatePage.submitButton().click()
      const punishmentAutomaticEndDatesPage = Page.verifyOnPage(PunishmentAutomaticEndDatesPage)
      punishmentAutomaticEndDatesPage.name().contains('Removal from wing or unit')
      punishmentAutomaticEndDatesPage
        .summary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Start date')
          expect($summaryLabels.get(1).innerText).to.contain('Number of days')
          expect($summaryLabels.get(2).innerText).to.contain('Last day')
        })
      punishmentAutomaticEndDatesPage
        .summary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('30 Dec 2030')
          expect($summaryData.get(2).innerText).to.contain('10')
          expect($summaryData.get(4).innerText).to.contain('8 Jan 2031')
        })
    })
  })
})
