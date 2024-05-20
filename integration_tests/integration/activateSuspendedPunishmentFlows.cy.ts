import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ActivateSuspendedPunishmentsPage from '../pages/activateSuspendedPunishments'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDays'
import PunishmentStartDateChoicePage from '../pages/punishmentStartDateChoice'
import PunishmentAutomaticEndDatesPage from '../pages/punishmentAutomaticEndDates'
import PunishmentStartDatePage from '../pages/punishmentStartDate'
import AwardPunishmentsPage from '../pages/awardPunishments'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { formatDateForDatePicker } from '../../server/utils/utils'

const susPun = [
  {
    chargeNumber: 100,
    status: ReportedAdjudicationStatus.CHARGE_PROVED,
    punishment: {
      id: 71,
      type: PunishmentType.PRIVILEGE,
      privilegeType: PrivilegeType.MONEY,
      activatedBy: 0,
      activatedFrom: 0,
      schedule: {
        duration: 5,
        suspendedUntil: '2023-04-29',
      },
    },
  },
  {
    chargeNumber: 101,
    status: ReportedAdjudicationStatus.CHARGE_PROVED,
    punishment: {
      id: 72,
      type: PunishmentType.ADDITIONAL_DAYS,
      activatedBy: 0,
      activatedFrom: 0,
      schedule: {
        duration: 5,
        suspendedUntil: '2023-04-29',
      },
    },
  },
  {
    chargeNumber: 102,
    status: ReportedAdjudicationStatus.CHARGE_PROVED,
    punishment: {
      id: 73,
      type: PunishmentType.PROSPECTIVE_DAYS,
      activatedBy: 0,
      activatedFrom: 0,
      schedule: {
        duration: 5,
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
      chargeNumber: 100,
      response: susPun,
    })
    cy.task('stubGetSuspendedPunishments', {
      prisonerNumber: 'G6415GD',
      chargeNumber: 103,
      response: susPun,
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
            }),
          ],
          punishments: [
            {
              id: 71,
              type: PunishmentType.PRIVILEGE,
              privilegeType: PrivilegeType.MONEY,
              rehabilitativeActivities: [],
              schedule: {
                duration: 5,
                suspendedUntil: '2023-04-29',
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
          punishments: [
            {
              id: 71,
              type: PunishmentType.ADDITIONAL_DAYS,
              rehabilitativeActivities: [],
              schedule: {
                duration: 5,
                suspendedUntil: '2023-04-29',
              },
            },
          ],
        }),
      },
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
              id: 71,
              type: PunishmentType.PROSPECTIVE_DAYS,
              rehabilitativeActivities: [],
              schedule: {
                duration: 5,
                suspendedUntil: '2023-04-29',
              },
            },
          ],
        }),
      },
    })

    cy.task('stubGetReportedAdjudication', {
      id: 103,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '103',
          status: ReportedAdjudicationStatus.INVALID_SUSPENDED,
          prisonerNumber: 'G6415GD',
          punishments: [
            {
              id: 71,
              type: PunishmentType.PROSPECTIVE_DAYS,
              rehabilitativeActivities: [],
              schedule: {
                duration: 5,
                suspendedUntil: '2023-04-29',
              },
            },
          ],
        }),
      },
    })

    cy.signIn()
  })
  describe('Suspended punishment automatic punishment date flows', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.subheading().should('exist')
      activateSuspendedPunishmentsPage.subheading().contains('John Smith’s suspended punishments')
      activateSuspendedPunishmentsPage.suspendedPunishmentsTable().should('exist')
      activateSuspendedPunishmentsPage.cancelLink().should('exist')
      activateSuspendedPunishmentsPage.guidanceContent().should('not.exist')
    })
    it('goes back to award punishments page if return link clicked', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.cancelLink().click()
      cy.location().should(loc => expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100')))
    })
    it('Suspended punishment starts immediately', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.suspendedPunishmentsTable().should('exist')
      activateSuspendedPunishmentsPage.activatePunishmentButton().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentNumberOfDays.urls.existing('100'))
        expect(loc.search).to.eq('?punishmentNumberToActivate=71&punishmentType=PRIVILEGE&duration=5')
      })
      const suspendedPunishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      suspendedPunishmentNumberOfDaysPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentStartDateChoice.urls.existing('100'))
      })
      const suspendedPunishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      suspendedPunishmentStartDateChoicePage.radioButtons().find('input[value="true"]').check()
      suspendedPunishmentStartDateChoicePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentAutoDates.urls.existing('100'))
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
          expect($summaryData.get(0).innerText).to.contain('3 Sep 2023')
          expect($summaryData.get(2).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('7 Sep 2023')
        })
      suspendedPunishmentAutomaticEndDatesPage.submitButton().click()
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Loss of money')
          expect($summaryData.get(1).innerText).to.contain('3 Sep 2023')
          expect($summaryData.get(2).innerText).to.contain('7 Sep 2023')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('100')
        })
    })
    it('Suspended punishment starts on a specified day', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.suspendedPunishmentsTable().should('exist')
      activateSuspendedPunishmentsPage.activatePunishmentButton().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentNumberOfDays.urls.existing('100'))
        expect(loc.search).to.eq('?punishmentNumberToActivate=71&punishmentType=PRIVILEGE&duration=5')
      })
      const suspendedPunishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      suspendedPunishmentNumberOfDaysPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentStartDateChoice.urls.existing('100'))
      })
      const suspendedPunishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      suspendedPunishmentStartDateChoicePage.radioButtons().find('input[value="false"]').check()
      suspendedPunishmentStartDateChoicePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentStartDate.urls.existing('100'))
      })
      const suspendedPunishmentStartDatePage = Page.verifyOnPage(PunishmentStartDatePage)
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      suspendedPunishmentStartDatePage.datepicker().type(date)
      suspendedPunishmentStartDatePage.submitButton().click()

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
          expect($summaryData.get(0).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(2).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('14 Oct 2030')
        })
      suspendedPunishmentAutomaticEndDatesPage.submitButton().click()
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Loss of money')
          expect($summaryData.get(1).innerText).to.contain('10 Oct 2030')
          expect($summaryData.get(2).innerText).to.contain('14 Oct 2030')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('100')
        })
    })
    it('Suspended punishment to activate is additional days', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.suspendedPunishmentsTable().should('exist')
      activateSuspendedPunishmentsPage.activatePunishmentButton().eq(1).click()
      const suspendedPunishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      suspendedPunishmentNumberOfDaysPage.submitButton().click()
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Additional days')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('101')
        })
    })
    it('Suspended punishment to activate is prospective days', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.suspendedPunishmentsTable().should('exist')
      activateSuspendedPunishmentsPage.activatePunishmentButton().eq(2).click()
      const suspendedPunishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      suspendedPunishmentNumberOfDaysPage.submitButton().click()
      const awardPunishmentsPage = Page.verifyOnPage(AwardPunishmentsPage)
      awardPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Prospective additional days')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('-')
          expect($summaryData.get(5).innerText).to.contain('102')
        })
    })
    it('should show guidance if report has status INVALID_SUSPENDED', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('103'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.guidanceContent().should('exist')
    })
  })
})
