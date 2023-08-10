import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ManualEntryConsecutivePunishmentErrorPage from '../pages/manualConsecutivePunishmentError'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Consecutive punishment charge number error', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
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
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.manualConsecutivePunishmentError.urls.start('100'))
      const manualEntryConsecutivePunishmentErrorPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentErrorPage)
      manualEntryConsecutivePunishmentErrorPage.info().should('exist')
      manualEntryConsecutivePunishmentErrorPage.cancelLink().should('exist')
      manualEntryConsecutivePunishmentErrorPage.button().should('exist')
    })
    it('should contain the info in the title and paragraph', () => {
      cy.visit(`${adjudicationUrls.manualConsecutivePunishmentError.urls.start('100')}?chargeNumber=1234567`)
      const manualEntryConsecutivePunishmentErrorPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentErrorPage)
      manualEntryConsecutivePunishmentErrorPage
        .h1()
        .contains('Charge number 1234567 is not linked to a punishment of added days for John Smith')
      manualEntryConsecutivePunishmentErrorPage
        .info()
        .contains('You cannot make the punishment of added days consecutive to charge number 1234567.')
    })
    it('should return to url in query', () => {
      cy.visit(
        `${adjudicationUrls.manualConsecutivePunishmentError.urls.start(
          '100'
        )}?chargeNumber=1234567&redirectUrl=${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS`
      )
      const manualEntryConsecutivePunishmentErrorPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentErrorPage)
      manualEntryConsecutivePunishmentErrorPage.button().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(`${adjudicationUrls.whichPunishmentIsItConsecutiveToManual.urls.start('100')}`)
        expect(loc.search).to.eq(`?punishmentType=ADDITIONAL_DAYS`)
      })
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.manualConsecutivePunishmentError.urls.start('100'))
      const manualEntryConsecutivePunishmentErrorPage = Page.verifyOnPage(ManualEntryConsecutivePunishmentErrorPage)
      manualEntryConsecutivePunishmentErrorPage.cancelLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
})
