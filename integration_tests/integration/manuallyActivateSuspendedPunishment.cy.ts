import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ManuallyActivateSuspendedPunishmentPage from '../pages/manuallyActivateSuspendedPunishment'
import AwardPunishmentsPage from '../pages/awardPunishments'
import CheckPunishmentsPage from '../pages/checkPunishments'
import PunishmentsAndDamagesPage from '../pages/punishmentsAndDamages'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDays'
import PunishmentStartDateChoicePage from '../pages/punishmentStartDateChoice'
import PunishmentAutomaticEndDatesPage from '../pages/punishmentAutomaticEndDates'
import PunishmentStartDatePage from '../pages/punishmentStartDate'

import { forceDateInput } from '../componentDrivers/dateInput'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import { HearingOutcomeCode, OutcomeCode } from '../../server/data/HearingAndOutcomeResult'
import NumberOfAdditionalDaysPage from '../pages/numberOfAdditionalDays'
import ManualEntryConsecutivePunishmentPage from '../pages/manualEntryConsecutivePunishment'

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
          chargeNumber: '100',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-09-02T10:50:00.000Z',
            }),
            testData.singleHearing({
              dateTimeOfHearing: '2023-10-10T22:00:00',
            }),
          ],
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
          chargeNumber: '101',
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
      chargeNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
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
    cy.task('stubValidateChargeNumber', {
      chargeNumber: '1234567',
      sanctionStatus: 'IMMEDIATE',
      offenderNo: 'G6415GD',
      responseBody: { status: 200 },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.submitButton().should('exist')
      punishmentPage.cancelButton().should('exist')
      punishmentPage.punishment().should('exist')
      cy.get('#punishmentType-8').should('not.exist')
      cy.get('#punishmentType-9').should('not.exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
    it('should show additional days and prospective additional days radios if the hearing is IA', () => {
      cy.visit(adjudicationUrls.punishment.urls.start('101'))
      cy.get('#punishmentType-10').should('exist')
      cy.get('[for="punishmentType-10"]').should('include.text', 'Additional days')
      cy.get('#punishmentType-11').should('exist')
      cy.get('[for="punishmentType-11"]').should('include.text', 'Prospective additional days')
    })
  })

  describe('Validation', () => {
    it('should error when no report number is entered', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
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
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
      punishmentPage.submitButton().click()

      punishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select a punishment or recovery of money for damages')
        })
    })
    it('should error when no privilege type selected', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
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
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
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
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
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
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
      punishmentPage.punishment().find('input[value="CONFINEMENT"]').check()

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentNumberOfDays.urls.manual('100'))
        expect(loc.search).to.eq(
          '?punishmentType=CONFINEMENT&privilegeType=&otherPrivilege=&stoppagePercentage=&chargeNumberForSuspendedPunishment=123456'
        )
      })
    })

    it('should submit successfully and redirect for type EARNINGS', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')

      punishmentPage.stoppagePercentage().type('10')
      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentNumberOfDays.urls.manual('100'))
        expect(loc.search).to.eq(
          '?punishmentType=EARNINGS&privilegeType=&otherPrivilege=&stoppagePercentage=10&chargeNumberForSuspendedPunishment=123456'
        )
      })
    })

    it('should submit successfully and redirect for type PRIVILEGE - CANTEEN', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
      punishmentPage.punishment().find('input[value="EARNINGS"]').check()
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="CANTEEN"]').check()

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentNumberOfDays.urls.manual('100'))
        expect(loc.search).to.eq(
          '?punishmentType=PRIVILEGE&privilegeType=CANTEEN&otherPrivilege=&stoppagePercentage=&chargeNumberForSuspendedPunishment=123456'
        )
      })
    })

    it('should submit successfully and redirect for type PRIVILEGE - OTHER', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="OTHER"]').check()
      punishmentPage.otherPrivilege().type('chocolate')

      punishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentNumberOfDays.urls.manual('100'))
        expect(loc.search).to.eq(
          '?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=chocolate&stoppagePercentage=&chargeNumberForSuspendedPunishment=123456'
        )
      })
    })

    const daysPunishmentTypes = [PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS]
    daysPunishmentTypes.forEach(punishmentType => {
      it(`should submit successfully and redirect for type PRIVILEGE - ${punishmentType}`, () => {
        cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('101'))
        const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
        punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
        punishmentPage.punishment().find(`input[value="${punishmentType}"]`).check()

        punishmentPage.submitButton().click()

        cy.location().should(loc => {
          expect(loc.pathname).to.eq(adjudicationUrls.numberOfAdditionalDays.urls.manualEdit('101'))
          expect(loc.search).to.eq(
            `?punishmentType=${punishmentType}&privilegeType=&otherPrivilege=&stoppagePercentage=&chargeNumberForSuspendedPunishment=123456`
          )
        })
      })
    })

    it('end to end - immediate', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="MONEY"]').check()
      punishmentPage.submitButton().click()

      const suspendedPunishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      suspendedPunishmentNumberOfDaysPage.days().type('5')
      suspendedPunishmentNumberOfDaysPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentStartDateChoice.urls.manual('100'))
      })
      const suspendedPunishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      suspendedPunishmentStartDateChoicePage.radioButtons().find('input[value="true"]').check()
      suspendedPunishmentStartDateChoicePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentAutoDates.urls.manual('100'))
      })
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
          expect($summaryData.get(0).innerText).to.contain('10 Oct 2023')
          expect($summaryData.get(2).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('14 Oct 2023')
        })

      suspendedPunishmentAutomaticEndDatesPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
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
            chargeNumber: '100',
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
                  }),
                },
              },
            ],
            punishments: [
              {
                id: 14,
                type: PunishmentType.PRIVILEGE,
                privilegeType: PrivilegeType.MONEY,
                activatedFrom: '123456',
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
    it('end to end - selected date', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
      punishmentPage.punishment().find('input[value="PRIVILEGE"]').check()
      punishmentPage.privilege().find('input[value="MONEY"]').check()
      punishmentPage.submitButton().click()

      const suspendedPunishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      suspendedPunishmentNumberOfDaysPage.days().type('5')
      suspendedPunishmentNumberOfDaysPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentStartDateChoice.urls.manual('100'))
      })
      const suspendedPunishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      suspendedPunishmentStartDateChoicePage.radioButtons().find('input[value="false"]').check()
      suspendedPunishmentStartDateChoicePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentStartDate.urls.manual('100'))
      })
      const suspendedPunishmentStartDatePage = Page.verifyOnPage(PunishmentStartDatePage)
      forceDateInput(12, 10, 2023, '[data-qa="punishment-start-date-picker"]')
      suspendedPunishmentStartDatePage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentAutoDates.urls.manual('100'))
      })
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
          expect($summaryData.get(0).innerText).to.contain('12 Oct 2023')
          expect($summaryData.get(2).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('16 Oct 2023')
        })

      suspendedPunishmentAutomaticEndDatesPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
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
            chargeNumber: '100',
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
                  }),
                },
              },
            ],
            punishments: [
              {
                id: 14,
                type: PunishmentType.PRIVILEGE,
                privilegeType: PrivilegeType.MONEY,
                activatedFrom: '123456',
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
    it('end to end - additional days', () => {
      cy.visit(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('101'))
      const punishmentPage = Page.verifyOnPage(ManuallyActivateSuspendedPunishmentPage)
      punishmentPage.chargeNumberForSuspendedPunishment().type('123456')
      punishmentPage.punishment().find('input[value="ADDITIONAL_DAYS"]').check()
      punishmentPage.submitButton().click()

      const numberOfAdditionalDaysPage = Page.verifyOnPage(NumberOfAdditionalDaysPage)
      numberOfAdditionalDaysPage.days().type('10')
      numberOfAdditionalDaysPage.submitButton().click()

      const manualEntryConsecutivePunishmentPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentPage)
      manualEntryConsecutivePunishmentPage.chargeNumber().type('1234567')
      manualEntryConsecutivePunishmentPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('101'))
      })

      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Additional days\n(consecutive to charge 1234567)')
          expect($summaryData.get(5).innerText).to.contain('123456')
        })
      awardPunishmentsPage.editPunishment().should('not.exist')
    })
  })
})
