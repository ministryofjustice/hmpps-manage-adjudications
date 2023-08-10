import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentPage from '../pages/punishment'
import ActivateSuspendedPunishmentsPage from '../pages/activateSuspendedPunishments'
import SuspendedPunishmentSchedule from '../pages/suspendedPunishmentSchedule'
import AwardPunishmentsPage from '../pages/awardPunishments'
import PunishmentSchedulePage from '../pages/punishmentSchedule'
import NumberOfAdditionalDaysPage from '../pages/numberOfAdditionalDays'
import WillPunishmentBeSuspendedPage from '../pages/willPunishmentBeSuspended'
import WillPunishmentBeConsecutivePage from '../pages/willPunishmentBeConsective'
import WhichPunishmentConsecutiveToPage from '../pages/whichPunishmentConsecutiveTo'
import { forceDateInput } from '../componentDrivers/dateInput'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const susPun = [
  {
    reportNumber: 101,
    punishment: {
      id: 71,
      type: PunishmentType.PRIVILEGE,
      privilegeType: PrivilegeType.MONEY,
      activatedBy: 0,
      activatedFrom: 0,
      schedule: {
        days: 5,
        suspendedUntil: '2023-04-29',
      },
    },
  },
  {
    reportNumber: 101,
    punishment: {
      id: 73,
      type: PunishmentType.ADDITIONAL_DAYS,
      activatedBy: 0,
      activatedFrom: 0,
      schedule: {
        days: 5,
        suspendedUntil: '2023-04-29',
      },
    },
  },
  {
    reportNumber: 101,
    punishment: {
      id: 74,
      type: PunishmentType.PROSPECTIVE_DAYS,
      activatedBy: 0,
      activatedFrom: 0,
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
                dateTimeOfHearing: '2024-11-23T17:00:00',
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
          reportNumber: 90,
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
          reportNumber: 95,
          chargeProvedDate: '2023-06-15',
          punishment: {
            type: PunishmentType.PROSPECTIVE_DAYS,
            id: 71,
            consecutiveReportNumber: 111,
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

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="CONFINEMENT"]').should('be.checked')
      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').should('be.checked')
      punishmentSchedulePage.suspendedUntil().should('have.value', '10/10/2030')

      punishmentSchedulePage.submitButton().click()
    })

    it('create and edit punishments - EARNINGS', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.stoppagePercentage().type('10')
      punishmentPage.submitButton().click()

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="no"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="start-date-picker"]')
      forceDateInput(20, 10, 2030, '[data-qa="end-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="EARNINGS"]').should('be.checked')
      punishmentPage.stoppagePercentage().should('have.value', '10')
      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')
      punishmentSchedulePage.suspended().find('input[value="no"]').should('be.checked')
      punishmentSchedulePage.startDate().should('have.value', '10/10/2030')
      punishmentSchedulePage.endDate().should('have.value', '20/10/2030')

      punishmentSchedulePage.submitButton().click()
    })

    it('create and edit punishments - PRIVILEGE - CANTEEN', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="CANTEEN"]').check()

      punishmentPage.submitButton().click()

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').should('be.checked')
      punishmentPage.privilege().find('input[value="CANTEEN"]').should('be.checked')
      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').should('be.checked')
      punishmentSchedulePage.suspendedUntil().should('have.value', '10/10/2030')

      punishmentSchedulePage.submitButton().click()
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

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')

      punishmentSchedulePage.submitButton().click()

      awardPunishmentsPage.editPunishment().first().click()

      punishmentPage.punishment().find('input[value="PRIVILEGE"]').should('be.checked')
      punishmentPage.privilege().find('input[value="OTHER"]').should('be.checked')
      punishmentPage.otherPrivilege().should('have.value', 'nintendo switch')

      punishmentPage.submitButton().click()

      punishmentSchedulePage.days().should('have.value', '10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').should('be.checked')
      punishmentSchedulePage.suspendedUntil().should('have.value', '10/10/2030')

      punishmentSchedulePage.submitButton().click()
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
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedule)
      suspendedPunishmentSchedulePage.days().type('10')
      forceDateInput(10, 10, 2030, '[data-qa="start-date-picker"]')
      forceDateInput(20, 10, 2030, '[data-qa="end-date-picker"]')
      suspendedPunishmentSchedulePage.submitButton().click()
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Loss of money')
          expect($summaryData.get(1).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(2).innerText).to.contain('20 Oct 2030')
          expect($summaryData.get(3).innerText).to.contain('10')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('101')
        })
      awardPunishmentsPage.editPunishment().should('not.exist')
      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)
      punishmentPage.punishment().find('input[value="REMOVAL_WING"]').check()

      punishmentPage.submitButton().click()

      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.suspended().should('exist')
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').click()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')

      punishmentSchedulePage.submitButton().click()
      awardPunishmentsPage.editPunishment().should('have.length', 1)
      awardPunishmentsPage.activateSuspendedPunishment().click()
      activateSuspendedPunishmentsPage
        .suspendedPunishmentsTable()
        .find('tr')
        .then(row => {
          expect(row.length).to.eq(3)
        })
    })
    // TODO: activate with v2EndpointsFlag
    it.skip('caution and damages radio buttons', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start('100'))
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)

      awardPunishmentsPage.newPunishment().click()
      const punishmentPage = Page.verifyOnPage(PunishmentPage)

      punishmentPage.punishment().find('input[value="CAUTION"]').should('exist')
      punishmentPage.punishment().find('input[value="DAMAGES_OWED"]').should('exist')

      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
      punishmentPage.submitButton().click()
      const punishmentSchedulePage = Page.verifyOnPage(PunishmentSchedulePage)
      punishmentSchedulePage.days().type('10')
      punishmentSchedulePage.suspended().find('input[value="yes"]').check()
      forceDateInput(10, 10, 2030, '[data-qa="suspended-until-date-picker"]')

      punishmentSchedulePage.submitButton().click()
      awardPunishmentsPage.newPunishment().click()

      punishmentPage.punishment().find('input[value="CAUTION"]').should('not.exist')
      punishmentPage.punishment().find('input[value="DAMAGES_OWED"]').check()
      cy.get('#damagesOwedAmount').type('50')
      punishmentPage.submitButton().click()
      awardPunishmentsPage.newPunishment().click()
      punishmentPage.punishment().find('input[value="DAMAGES_OWED"]').should('not.exist')
    })
  })
})
