import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import WhichPunishmentConsecutiveToPage from '../pages/whichPunishmentConsecutiveTo'
import { PunishmentType } from '../../server/data/PunishmentResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('which punishment will it be consecutive to page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'AY124DP',
      response: testData.prisonerResultSummary({
        offenderNo: 'AY124DP',
        firstName: 'JANE',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetConsecutivePunishments', {
      prisonerNumber: 'G6415GD',
      punishmentType: PunishmentType.ADDITIONAL_DAYS,
      chargeNumber: '100',
      response: [
        {
          chargeNumber: 90,
          chargeProvedDate: '2023-06-21',
          punishment: {
            id: 70,
            type: PunishmentType.ADDITIONAL_DAYS,
            schedule: {
              duration: 10,
            },
          },
        },
        {
          chargeNumber: 95,
          chargeProvedDate: '2023-06-15',
          punishment: {
            type: PunishmentType.ADDITIONAL_DAYS,
            id: 71,
            consecutiveChargeNumber: '111',
            schedule: {
              duration: 5,
            },
          },
        },
      ],
    })
    cy.task('stubGetConsecutivePunishments', {
      prisonerNumber: 'AY124DP',
      punishmentType: PunishmentType.ADDITIONAL_DAYS,
      chargeNumber: '101',
      response: [],
    })
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'AY124DP',
        }),
      },
    })
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&duration=5`
      )
      const whichPunishmentConsecutiveToPage = Page.verifyOnPage(WhichPunishmentConsecutiveToPage)
      whichPunishmentConsecutiveToPage.table().should('exist')
      whichPunishmentConsecutiveToPage.emptyDataPara().should('not.exist')
      whichPunishmentConsecutiveToPage.selectButton().should('exist')
      whichPunishmentConsecutiveToPage.cancelLink().should('exist')
    })
    it('should contain the required page elements - no data', () => {
      cy.visit(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start(
          '101'
        )}?punishmentType=ADDITIONAL_DAYS&duration=5`
      )
      const whichPunishmentConsecutiveToPage = Page.verifyOnPage(WhichPunishmentConsecutiveToPage)
      whichPunishmentConsecutiveToPage.table().should('not.exist')
      whichPunishmentConsecutiveToPage.emptyDataPara().should('exist')
      whichPunishmentConsecutiveToPage.selectButton().should('not.exist')
      whichPunishmentConsecutiveToPage.cancelLink().should('exist')
    })
    it('should have the correct details in the table', () => {
      cy.visit(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&duration=5`
      )
      const whichPunishmentConsecutiveToPage = Page.verifyOnPage(WhichPunishmentConsecutiveToPage)
      whichPunishmentConsecutiveToPage
        .table()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Additional days')
          expect($summaryData.get(1).innerText).to.contain('10')
          expect($summaryData.get(2).innerText).to.contain('90')
          expect($summaryData.get(3).innerText).to.contain('21 Jun 2023')
          expect($summaryData.get(5).innerText).to.contain('Additional days\n(consecutive to charge 111)')
          expect($summaryData.get(6).innerText).to.contain('5')
          expect($summaryData.get(7).innerText).to.contain('95')
          expect($summaryData.get(8).innerText).to.contain('15 Jun 2023')
        })
    })
    it('goes back to award punishments page if return link clicked', () => {
      cy.visit(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&duration=5`
      )
      const whichPunishmentConsecutiveToPage = Page.verifyOnPage(WhichPunishmentConsecutiveToPage)
      whichPunishmentConsecutiveToPage.cancelLink().click()
      cy.location().should(loc => expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100')))
    })
    it('goes to the award punishment page if the activate button is clicked', () => {
      cy.visit(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&duration=5`
      )
      const whichPunishmentConsecutiveToPage = Page.verifyOnPage(WhichPunishmentConsecutiveToPage)
      whichPunishmentConsecutiveToPage.selectButton().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
      cy.get('[data-qa="punishments-table"]')
        .get('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Additional days')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('5')
        })
    })
  })
})
