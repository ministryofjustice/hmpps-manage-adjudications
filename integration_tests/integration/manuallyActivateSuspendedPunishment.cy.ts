import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ManuallyActivateSuspendedPunishmentPage from '../pages/manuallyActivateSuspendedPunishment'
import SuspendedPunishmentSchedule from '../pages/suspendedPunishmentSchedule'
import AwardPunishmentsPage from '../pages/awardPunishments'
import CheckPunishmentsPage from '../pages/checkPunishments'
import PunishmentsAndDamagesPage from '../pages/punishmentsAndDamages'
import { forceDateInput } from '../componentDrivers/dateInput'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import { HearingOutcomeCode, OutcomeCode } from '../../server/data/HearingAndOutcomeResult'

const testData = new TestData()
context('Manually activate an existing suspended punishment', () => {
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
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                  amount: 100.5,
                  caution: false,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 101,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-03-10T22:00:00',
              oicHearingType: OicHearingType.INAD_ADULT,
              outcome: testData.hearingOutcome({
                code: HearingOutcomeCode.COMPLETE,
              }),
            }),
          ],
        }),
      },
    })
    cy.task('stubCreatePunishments', {
      adjudicationNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [
            {
              id: 14,
              type: PunishmentType.PRIVILEGE,
              privilegeType: PrivilegeType.MONEY,
              schedule: {
                days: 5,
                startDate: '2030-10-10',
                endDate: '2030-10-20',
              },
            },
          ],
        }),
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
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.submitButton().should('exist')
      punishmentPage.cancelButton().should('exist')
      punishmentPage.punishment().should('exist')
      cy.get('#punishmentType-8').should('not.exist')
      cy.get('#punishmentType-9').should('not.exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified(100))
      })
    })
    it('should show additional days and prospective additional days radios if the hearing is IA', () => {
      cy.visit(adjudicationUrls.punishment.urls.start(101))
      cy.get('#punishmentType-8').should('exist')
      cy.get('[for="punishmentType-8"]').should('include.text', 'Additional days')
      cy.get('#punishmentType-9').should('exist')
      cy.get('[for="punishmentType-9"]').should('include.text', 'Prospective additional days')
    })
  })

  describe('Validation', () => {
    it('should error when no report number is entered', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()
      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter charge number')
        })
    })
    it('should error when no punishment type selected', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.reportNumber().type('123456')
      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the type of punishment')
        })
    })
    it('should error when no privilege type selected', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.reportNumber().type('123456')
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()

      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select the type of privilege')
        })
    })
    it('should error when no other privilege selected', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.reportNumber().type('123456')
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="OTHER"]').check()

      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter a privilege to be withdrawn')
        })
    })
    it('should error when no  stoppage percentage selected', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.reportNumber().type('123456')
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()

      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the percentage of earnings to be stopped')
        })
    })
  })

  describe('Submit', () => {
    it('should submit successfully and redirect for type CONFINEMENT', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.reportNumber().type('123456')
      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentSchedule.urls.manual(100))
        expect(loc.search).to.eq(
          '?punishmentType=CONFINEMENT&privilegeType=&otherPrivilege=&stoppagePercentage=&reportNo=123456'
        )
      })
    })

    it('should submit successfully and redirect for type EARNINGS', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.reportNumber().type('123456')

      punishmentPage.stoppagePercentage().type('10')
      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentSchedule.urls.manual(100))
        expect(loc.search).to.eq(
          '?punishmentType=EARNINGS&privilegeType=&otherPrivilege=&stoppagePercentage=10&reportNo=123456'
        )
      })
    })

    it('should submit successfully and redirect for type PRIVILEGE - CANTEEN', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.reportNumber().type('123456')
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="CANTEEN"]').check()

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentSchedule.urls.manual(100))
        expect(loc.search).to.eq(
          '?punishmentType=PRIVILEGE&privilegeType=CANTEEN&otherPrivilege=&stoppagePercentage=&reportNo=123456'
        )
      })
    })

    it('should submit successfully and redirect for type PRIVILEGE - OTHER', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.reportNumber().type('123456')
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="OTHER"]').check()
      punishmentPage.otherPrivilege().type('chocolate')

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentSchedule.urls.manual(100))
        expect(loc.search).to.eq(
          '?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=chocolate&stoppagePercentage=&reportNo=123456'
        )
      })
    })

    const daysPunishmentTypes = [PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS]
    daysPunishmentTypes.forEach(punishmentType => {
      it(`should submit successfully and redirect for type PRIVILEGE - ${punishmentType}`, () => {
        cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(101))
        const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
        punishmentPage.reportNumber().type('123456')
        punishmentPage.punishment().find(`input[value="${punishmentType}"]`).check()

        punishmentPage.submitButton().click()

        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.numberOfAdditionalDays.urls.manualEdit(101, undefined))
          expect(loc.search).to.eq(
            `?punishmentType=${punishmentType}&privilegeType=&otherPrivilege=&stoppagePercentage=&reportNo=123456`
          )
        })
      })
    })

    it('end to end', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start(100))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.reportNumber().type('123456')
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="MONEY"]').check()
      punishmentPage.submitButton().click()
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedule)
      suspendedPunishmentSchedulePage.days().type('5')
      forceDateInput(10, 10, 2030, '[data-qa="start-date-picker"]')
      forceDateInput(20, 10, 2030, '[data-qa="end-date-picker"]')
      suspendedPunishmentSchedulePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified(100))
      })
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(5).innerText).to.contain('123456')
        })
      awardPunishmentsPage.editPunishment().should('not.exist')
      awardPunishmentsPage.continue().click()
      const checkPunishmentsPage = Page.verifyOnPage(CheckPunishmentsPage)
      cy.task('stubGetReportedAdjudication', {
        id: 100,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            adjudicationNumber: 100,
            status: ReportedAdjudicationStatus.CHARGE_PROVED,
            prisonerNumber: 'G6415GD',
            outcomes: [
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2023-03-10T22:00:00',
                  outcome: testData.hearingOutcome({
                    code: HearingOutcomeCode.COMPLETE,
                  }),
                }),
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.CHARGE_PROVED,
                    amount: 100.5,
                    caution: false,
                  }),
                },
              },
            ],
            punishments: [
              {
                id: 14,
                type: PunishmentType.PRIVILEGE,
                privilegeType: PrivilegeType.MONEY,
                activatedFrom: 123456,
                schedule: {
                  days: 5,
                  startDate: '2030-10-10',
                  endDate: '2030-10-20',
                },
              },
            ],
          }),
        },
      })
      checkPunishmentsPage.submitButton().click()
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage
        .awardPunishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(5).innerText).to.contain('123456')
        })
    })
  })
})
