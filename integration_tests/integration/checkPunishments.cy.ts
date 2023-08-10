import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import CheckPunishments from '../pages/checkPunishments'
import Page from '../pages/page'
import { forceDateInputWithDate } from '../componentDrivers/dateInput'
import { PunishmentType } from '../../server/data/PunishmentResult'

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
    cy.task('stubGetReportedAdjudicationV1', {
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
    cy.task('stubGetReportedAdjudicationV1', {
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
      cy.get('#punishmentType-3').click()
      cy.get('[data-qa="punishment-submit"]').click()
      cy.get('#days').type('5')
      cy.get('#suspended').click()
      const date = new Date('2023-04-13')
      forceDateInputWithDate(date, '[data-qa="suspended-until-date-picker"]')
      cy.get('[data-qa="punishment-schedule-submit"]').click()
      cy.get('[data-qa="add-new-punishment-button"]').click()
      cy.get('#punishmentType-2').click()
      cy.get('#stoppagePercentage').type('25')
      cy.get('[data-qa="punishment-submit"]').click()
      cy.get('#days').type('2')
      cy.get('#suspended-2').click()
      const date2 = new Date('2023-04-15')
      forceDateInputWithDate(date, '[data-qa="start-date-picker"]')
      forceDateInputWithDate(date2, '[data-qa="end-date-picker"]')
      cy.get('[data-qa="punishment-schedule-submit"]').click()
      cy.get('[data-qa="punishments-continue').click()
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
          expect($summaryData.get(9).innerText).to.contain('13 Apr 2023')
          expect($summaryData.get(10).innerText).to.contain('15 Apr 2023')
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
      cy.get('#punishmentType-2').click()
      cy.get('#stoppagePercentage').type('25')
      cy.get('[data-qa="punishment-submit"]').click()
      cy.get('#days').type('2')
      cy.get('#suspended-2').click()
      const date = new Date('2023-04-13')
      const date2 = new Date('2023-04-15')
      forceDateInputWithDate(date, '[data-qa="start-date-picker"]')
      forceDateInputWithDate(date2, '[data-qa="end-date-picker"]')
      cy.get('[data-qa="punishment-schedule-submit"]').click()
      cy.get('[data-qa="punishments-continue').click()
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
          expect($summaryData.get(9).innerText).to.contain('13 Apr 2023')
          expect($summaryData.get(10).innerText).to.contain('15 Apr 2023')
          expect($summaryData.get(11).innerText).to.contain('2')
          expect($summaryData.get(12).innerText).to.contain('-')
          expect($summaryData.get(13).innerText).to.contain('-')
        })
      checkPunishmentsPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('456'))
      })
    })
  })
})
