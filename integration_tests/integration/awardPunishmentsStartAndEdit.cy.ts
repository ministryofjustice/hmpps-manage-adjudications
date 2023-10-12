import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentPage from '../pages/punishment'
import ActivateSuspendedPunishmentsPage from '../pages/activateSuspendedPunishments'
import AwardPunishmentsPage from '../pages/awardPunishments'
import NumberOfAdditionalDaysPage from '../pages/numberOfAdditionalDays'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDays'
import PunishmentIsSuspendedPage from '../pages/punishmentIsSuspended'
import PunishmentSuspendedUntilPage from '../pages/punishmentSuspendedUntil'
import PunishmentStartDateChoicePage from '../pages/punishmentStartDateChoice'
import PunishmentAutomaticEndDatesPage from '../pages/punishmentAutomaticEndDates'
import WillPunishmentBeSuspendedPage from '../pages/willPunishmentBeSuspended'
import WillPunishmentBeConsecutivePage from '../pages/willPunishmentBeConsective'
import WhichPunishmentConsecutiveToPage from '../pages/whichPunishmentConsecutiveTo'
import DamagesAmountPage from '../pages/damagesAmountOwed'
import { forceDateInput } from '../componentDrivers/dateInput'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const susPun = [
  {
    chargeNumber: '101',
    punishment: {
      id: 71,
      type: PunishmentType.PRIVILEGE,
      privilegeType: PrivilegeType.MONEY,
      activatedBy: '0',
      activatedFrom: '0',
      schedule: {
        days: 5,
        suspendedUntil: '2023-04-29',
      },
    },
  },
  {
    chargeNumber: '101',
    punishment: {
      id: 73,
      type: PunishmentType.ADDITIONAL_DAYS,
      activatedBy: '0',
      activatedFrom: '0',
      schedule: {
        days: 5,
        suspendedUntil: '2023-04-29',
      },
    },
  },
  {
    chargeNumber: '101',
    punishment: {
      id: 74,
      type: PunishmentType.PROSPECTIVE_DAYS,
      activatedBy: '0',
      activatedFrom: '0',
      schedule: {
        days: 5,
        suspendedUntil: '2023-04-29',
      },
    },
  },
]

const testData = new TestData()
context('e2e tests to create and edit punishments and schedules with redis', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.signIn()
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
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: {
          ...testData.reportedAdjudication({
            punishments: [],
            chargeNumber: '101',
            prisonerNumber: 'G6415GD',
            locationId: 25538,
            hearings: [
              testData.singleHearing({
                dateTimeOfHearing: '2024-11-23T17:00:00',
                oicHearingType: OicHearingType.INAD_ADULT,
                id: 69,
              }),
            ],
          }),
        },
      },
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetSuspendedPunishments', {
      prisonerNumber: 'G6415GD',
      reportNumber: 100,
      response: susPun,
    })
    cy.task('stubGetSuspendedPunishments', {
      prisonerNumber: 'G6415GD',
      reportNumber: 101,
      response: susPun,
    })
    cy.task('stubGetReportedAdjudication', {
      id: 102,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '102',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [
            {
              id: 72,
              type: PunishmentType.PRIVILEGE,
              privilegeType: PrivilegeType.CANTEEN,
              schedule: {
                days: 5,
                suspendedUntil: '2023-04-29',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetConsecutivePunishments', {
      prisonerNumber: 'G6415GD',
      punishmentType: PunishmentType.PROSPECTIVE_DAYS,
      chargeNumber: 101,
      response: [
        {
          chargeNumber: 90,
          chargeProvedDate: '2023-06-21',
          punishment: {
            id: 70,
            type: PunishmentType.PROSPECTIVE_DAYS,
            schedule: {
              days: 10,
            },
          },
        },
        {
          chargeNumber: 95,
          chargeProvedDate: '2023-06-15',
          punishment: {
            type: PunishmentType.PROSPECTIVE_DAYS,
            id: 71,
            consecutiveChargeNumber: '111',
            schedule: {
              days: 5,
            },
          },
        },
      ],
    })
  })

  describe('e2e', () => {
    it('create and edit punishments - CONFINEMENT', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
      punishmentPage.submitButton().click()

      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('10')
      punishmentNumberOfDaysPage.submitButton().click()

      const punishmentSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentSuspendedPage.suspended().find('input[value="yes"]').check()
      punishmentSuspendedPage.submitButton().click()

      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')
      punishmentSuspendedUntilPage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()
      punishmentPage.punishment().find('input[value="CONFINEMENT"]').should('be.checked')
      punishmentPage.submitButton().click()

      punishmentNumberOfDaysPage.days().should('have.value', '10')
      punishmentNumberOfDaysPage.submitButton().click()

      punishmentSuspendedPage.suspended().find('input[value="yes"]').should('be.checked')
      punishmentSuspendedPage.submitButton().click()

      punishmentSuspendedUntilPage.suspendedUntil().should('have.value', '10/10/2030')
      punishmentSuspendedUntilPage.submitButton().click()
    })

    it('create and edit punishments - EARNINGS', () => {
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

      const punishmentSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentSuspendedPage.suspended().find('input[value="no"]').check()
      punishmentSuspendedPage.submitButton().click()

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

    it('create and edit punishments - PRIVILEGE - CANTEEN', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="CANTEEN"]').check()
      punishmentPage.submitButton().click()

      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('10')
      punishmentNumberOfDaysPage.submitButton().click()

      const punishmentSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentSuspendedPage.suspended().find('input[value="yes"]').check()
      punishmentSuspendedPage.submitButton().click()

      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')
      punishmentSuspendedUntilPage.submitButton().click()

      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Loss of canteen')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('10')
          expect($summaryData.get(4).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
    })

    it('create and edit punishments - PRIVILEGE - GYM', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="GYM"]').check()

      punishmentPage.submitButton().click()

      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('10')
      punishmentNumberOfDaysPage.submitButton().click()

      const punishmentSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentSuspendedPage.suspended().find('input[value="yes"]').check()
      punishmentSuspendedPage.submitButton().click()

      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')
      punishmentSuspendedUntilPage.submitButton().click()

      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Loss of gym')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('10')
          expect($summaryData.get(4).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
    })

    it('create and edit punishments - PRIVILEGE - OTHER', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="OTHER"]').check()
      punishmentPage.otherPrivilege().type('nintendo switch')
      punishmentPage.submitButton().click()

      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('10')
      punishmentNumberOfDaysPage.submitButton().click()

      const punishmentSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentSuspendedPage.suspended().find('input[value="yes"]').check()
      punishmentSuspendedPage.submitButton().click()

      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')
      punishmentSuspendedUntilPage.submitButton().click()

      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Loss of nintendo switch')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('10')
          expect($summaryData.get(4).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(5).innerText).to.contain('-')
        })
    })

    it('create and edit punishments - PROSPECTIVE DAYS', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('101'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PROSPECTIVE_DAYS"]').check()

      punishmentPage.submitButton().click()

      const numberOfAdditionalDaysPage = Page.verifyOnPage(NumberOfAdditionalDaysPage)
      numberOfAdditionalDaysPage.days().type('10')
      numberOfAdditionalDaysPage.submitButton().click()

      const willPunishmentBeSuspendedPage = Page.verifyOnPage(WillPunishmentBeSuspendedPage)
      willPunishmentBeSuspendedPage.suspended().find('input[value="no"]').click()
      willPunishmentBeSuspendedPage.submitButton().click()

      const willPunishmentBeConsecutivePage = Page.verifyOnPage(WillPunishmentBeConsecutivePage)
      willPunishmentBeConsecutivePage.consecutive().find('input[value="yes"]').click()
      willPunishmentBeConsecutivePage.submitButton().click()

      const whichPunishmentConsecutiveToPage = Page.verifyOnPage(WhichPunishmentConsecutiveToPage)
      whichPunishmentConsecutiveToPage.selectButton().last().click()

      Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Prospective additional days\n(consecutive to charge 95)')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('10')
        })
    })

    it('Activate a suspended punishment and include report number in correct column, remove change link', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage.activateSuspendedPunishment().click()
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage
        .suspendedPunishmentsTable()
        .find('tr')
        .then(row => {
          expect(row.length).to.eq(4)
        })
      activateSuspendedPunishmentsPage.activatePunishmentButton().first().click()
      const suspendedPunishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      suspendedPunishmentNumberOfDaysPage.submitButton().click()
      const suspendedPunishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      suspendedPunishmentStartDateChoicePage.radioButtons().find('input[value="true"]').check()
      suspendedPunishmentStartDateChoicePage.submitButton().click()

      const suspendedPunishmentAutomaticEndDatesPage = Page.verifyOnPage(PunishmentAutomaticEndDatesPage)
      suspendedPunishmentAutomaticEndDatesPage.name().contains('Loss of money')
      suspendedPunishmentAutomaticEndDatesPage
        .summary()
        .find('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Start date')
          expect($summaryLabels.get(1).innerText).to.contain('Number of days')
          expect($summaryLabels.get(2).innerText).to.contain('Last day')
        })
      suspendedPunishmentAutomaticEndDatesPage
        .summary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('23 Nov 2030')
          expect($summaryData.get(2).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('27 Nov 2030')
        })
      suspendedPunishmentAutomaticEndDatesPage.submitButton().click()

      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Loss of money')
          expect($summaryData.get(1).innerText).to.contain('23 Nov 2030')
          expect($summaryData.get(2).innerText).to.contain('27 Nov 2030')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('101')
        })
      awardPunishmentsPage.editPunishment().should('not.exist')
    })
    it('caution and damages radio buttons', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="CAUTION"]').should('exist')
      punishmentPage.punishment().find('input[value="DAMAGES_OWED"]').should('exist')

      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
      punishmentPage.submitButton().click()

      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.days().type('10')
      punishmentNumberOfDaysPage.submitButton().click()

      const punishmentSuspendedPage = Page.verifyOnPage(PunishmentIsSuspendedPage)
      punishmentSuspendedPage.suspended().find('input[value="yes"]').click()
      punishmentSuspendedPage.submitButton().click()

      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')
      punishmentSuspendedUntilPage.submitButton().click()

      awardPunishmentsPage.newPunishment().click()

      punishmentPage.punishment().find('input[value="CAUTION"]').should('not.exist')
      punishmentPage.punishment().find('input[value="DAMAGES_OWED"]').check()
      cy.get('#damagesOwedAmount').type('50')
      punishmentPage.submitButton().click()
      awardPunishmentsPage.newPunishment().click()
      punishmentPage.punishment().find('input[value="DAMAGES_OWED"]').should('not.exist')
    })
    it('change link for damages goes to separate page', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="DAMAGES_OWED"]').check()
      cy.get('#damagesOwedAmount').type('50')
      punishmentPage.submitButton().click()
      cy.get('[data-qa="edit-damages"]').click()
      const damagesAmountPage = Page.verifyOnPage(DamagesAmountPage)
      damagesAmountPage.damagesAmount().should('have.value', 50)
    })
  })
})
