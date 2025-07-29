import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentSuspendedUntilPage from '../pages/punishmentSuspendedUntil'
import { formatDateForDatePicker } from '../../server/utils/utils'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PrivilegeType, PunishmentType } from '../../server/data/PunishmentResult'

const testData = new TestData()
context('Punishment - when is it suspended until?', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [testData.punishmentWithSchedule({ type: PunishmentType.CAUTION })],
          hearings: [
            testData.singleHearing({ dateTimeOfHearing: '2025-10-03', oicHearingType: OicHearingType.GOV_ADULT }),
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
            testData.punishmentWithSchedule({ type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.TV }),
          ],
          hearings: [
            testData.singleHearing({ dateTimeOfHearing: '2025-10-03', oicHearingType: OicHearingType.GOV_ADULT }),
          ],
        }),
      },
    })

    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.punishmentSuspendedUntil.urls.start('100'))
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      punishmentSuspendedUntilPage.submitButton().should('exist')
      punishmentSuspendedUntilPage.cancelButton().should('exist')
      punishmentSuspendedUntilPage.suspendedUntil().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentSuspendedUntil.urls.start('100'))
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      punishmentSuspendedUntilPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no suspended date is entered selected', () => {
      cy.visit(adjudicationUrls.punishmentSuspendedUntil.urls.start('100'))
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      punishmentSuspendedUntilPage.submitButton().click()
      punishmentSuspendedUntilPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the date the punishment is suspended until')
        })
    })
  })

  describe('saves successfully and redirects - not a match for rehab activity', () => {
    it('should go to correct page when suspended', () => {
      cy.visit(`${adjudicationUrls.punishmentSuspendedUntil.urls.start('100')}?punishmentType=CAUTION`)
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      punishmentSuspendedUntilPage.suspendedUntil().type(date)
      punishmentSuspendedUntilPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
    it('should go to correct page when suspended - meets requirements for rehab activity', () => {
      cy.visit(
        `${adjudicationUrls.punishmentSuspendedUntil.urls.start('101')}?punishmentType=PRIVILEGE&privilegeType=TV`,
      )
      const punishmentSuspendedUntilPage = Page.verifyOnPage(PunishmentSuspendedUntilPage)
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      punishmentSuspendedUntilPage.suspendedUntil().type(date)
      punishmentSuspendedUntilPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.include(adjudicationUrls.punishmentHasRehabilitativeActivities.urls.start('101', ''))
      })
    })
  })
})
