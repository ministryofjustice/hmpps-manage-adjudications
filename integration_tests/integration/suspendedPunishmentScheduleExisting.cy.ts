import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import SuspendedPunishmentSchedulePage from '../pages/suspendedPunishmentSchedule'
import { forceDateInput } from '../componentDrivers/dateInput'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const susPun = [
  {
    reportNumber: 100,
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
      id: 72,
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
    reportNumber: 102,
    punishment: {
      id: 73,
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
context('Suspended punishment schedule', () => {
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
    cy.task('stubGetSuspendedPunishments', {
      prisonerNumber: 'G6415GD',
      reportNumber: 102,
      response: susPun,
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
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
    cy.task('stubGetReportedAdjudicationV1', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [
            {
              id: 71,
              type: PunishmentType.ADDITIONAL_DAYS,
              schedule: {
                days: 5,
                suspendedUntil: '2023-04-29',
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: 102,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '102',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [
            {
              id: 71,
              type: PunishmentType.PROSPECTIVE_DAYS,
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
  describe('Loads', () => {
    it('should contain the required page elements - types other than additional days/prospective additional days', () => {
      cy.visit(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('100')}?punishmentType=PRIVILEGE&days=10`)
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.submitButton().should('exist')
      suspendedPunishmentSchedulePage.cancelButton().should('exist')
      suspendedPunishmentSchedulePage.days().should('exist')
      suspendedPunishmentSchedulePage.days().should('have.value', 10)
      suspendedPunishmentSchedulePage.startDate().should('exist')
      suspendedPunishmentSchedulePage.endDate().should('exist')
    })
    it('should contain the required page elements - type additional days', () => {
      cy.visit(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('101')}?punishmentType=ADDITIONAL_DAYS&days=10`
      )
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.submitButton().should('exist')
      suspendedPunishmentSchedulePage.cancelButton().should('exist')
      suspendedPunishmentSchedulePage.days().should('exist')
      suspendedPunishmentSchedulePage.days().should('have.value', 10)
      suspendedPunishmentSchedulePage.startDate().should('not.exist')
      suspendedPunishmentSchedulePage.endDate().should('not.exist')
    })
    it('should contain the required page elements - type prospective additional days', () => {
      cy.visit(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('102')}?punishmentType=PROSPECTIVE_DAYS`)
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.submitButton().should('exist')
      suspendedPunishmentSchedulePage.cancelButton().should('exist')
      suspendedPunishmentSchedulePage.days().should('exist')
      suspendedPunishmentSchedulePage.startDate().should('not.exist')
      suspendedPunishmentSchedulePage.endDate().should('not.exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('100')}?punishmentType=PRIVILEGE`)
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no days entered', () => {
      cy.visit(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('100')}?punishmentType=PRIVILEGE`)
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.submitButton().click()

      suspendedPunishmentSchedulePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter how many days the punishment will last')
        })
    })
    it('should error when suspended no start date selected', () => {
      cy.visit(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('100')}?punishmentType=PRIVILEGE`)
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.days().type('10')
      forceDateInput(10, 10, 2030, '[data-qa="end-date-picker"]')
      suspendedPunishmentSchedulePage.submitButton().click()

      suspendedPunishmentSchedulePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the date this punishment will start')
        })
    })
    it('should error when suspended no end date selected', () => {
      cy.visit(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('100')}?punishmentType=PRIVILEGE`)
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.days().type('10')
      forceDateInput(10, 10, 2030, '[data-qa="start-date-picker"]')
      suspendedPunishmentSchedulePage.submitButton().click()

      suspendedPunishmentSchedulePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the last day of this punishment')
        })
    })
    it('additional days - no error when dates are not entered', () => {
      cy.visit(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('101')}?punishmentType=ADDITIONAL_DAYS`)
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.days().type('10')
      suspendedPunishmentSchedulePage.submitButton().click()
      suspendedPunishmentSchedulePage.errorSummary().should('not.exist')
    })
    it('prospective additional days - no error when dates are not entered', () => {
      cy.visit(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing('102')}?punishmentType=ADDITIONAL_DAYS`)
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.days().type('10')
      suspendedPunishmentSchedulePage.submitButton().click()
      suspendedPunishmentSchedulePage.errorSummary().should('not.exist')
    })
  })

  describe('saves successfully and redirects', () => {
    it('should save when user enters days, start date and end date', () => {
      cy.visit(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(
          '100'
        )}?punishmentType=PRIVILEGE&punishmentNumberToActivate=71`
      )
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.days().type('10')
      forceDateInput(10, 10, 2030, '[data-qa="start-date-picker"]')
      forceDateInput(20, 10, 2030, '[data-qa="end-date-picker"]')
      suspendedPunishmentSchedulePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
    it('should save when user enters days - additional days', () => {
      cy.visit(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(
          '101'
        )}?punishmentType=ADDITIONAL_DAYS&punishmentNumberToActivate=72`
      )
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.days().type('10')
      suspendedPunishmentSchedulePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('101'))
      })
    })
    it('should save when user enters days - prospective additional days', () => {
      cy.visit(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(
          '102'
        )}?punishmentType=PROSPECTIVE_DAYS&punishmentNumberToActivate=73`
      )
      const suspendedPunishmentSchedulePage = Page.verifyOnPage(SuspendedPunishmentSchedulePage)
      suspendedPunishmentSchedulePage.days().type('10')
      suspendedPunishmentSchedulePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('102'))
      })
    })
  })
})
