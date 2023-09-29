import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ActivateSuspendedPunishmentsPage from '../pages/activateSuspendedPunishments'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('acivate suspended punishments page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.signIn()
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
      response: [
        {
          chargeNumber: 100,
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
          chargeNumber: 101,
          punishment: {
            id: 72,
            type: PunishmentType.PRIVILEGE,
            privilegeType: PrivilegeType.CANTEEN,
            activatedBy: 0,
            activatedFrom: 0,
            schedule: {
              days: 5,
              suspendedUntil: '2023-04-29',
            },
          },
        },
      ],
    })
    cy.task('stubGetReportedAdjudication', {
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
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.subheading().should('exist')
      activateSuspendedPunishmentsPage.subheading().contains('John Smith’s suspended punishments')
      activateSuspendedPunishmentsPage.suspendedPunishmentsTable().should('exist')
      activateSuspendedPunishmentsPage.enterManuallyLink().should('exist')
      activateSuspendedPunishmentsPage.cancelLink().should('exist')
    })
    it('should have the correct details in the table', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage
        .suspendedPunishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Loss of money')
          expect($summaryData.get(1).innerText).to.contain('100')
          expect($summaryData.get(2).innerText).to.contain('5')
          expect($summaryData.get(3).innerText).to.contain('29 Apr 2023')
        })
    })
    it('goes back to award punishments page if return link clicked', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.cancelLink().click()
      cy.location().should(loc => expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100')))
    })
    it('goes to manually add suspended punishment page if link is clicked', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.enterManuallyLink().click()
      cy.location().should(loc =>
        expect(loc.pathname).to.eq(adjudicationUrls.manuallyActivateSuspendedPunishment.urls.start('100'))
      )
    })
    it.skip('goes to the suspended punishment schedule page if the activate button is clicked', () => {
      cy.visit(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      const activateSuspendedPunishmentsPage = Page.verifyOnPage(ActivateSuspendedPunishmentsPage)
      activateSuspendedPunishmentsPage.activatePunishmentButton().first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.suspendedPunishmentSchedule.urls.existing('100'))
        expect(loc.search).to.eq('?punishmentNumberToActivate=71&punishmentType=PRIVILEGE&days=5')
      })
    })
  })
})
