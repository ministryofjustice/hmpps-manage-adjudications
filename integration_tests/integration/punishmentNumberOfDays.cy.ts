import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentNumberOfDaysPage from '../pages/punishmentNumberOfDays'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { OutcomeHistory } from '../../server/data/HearingAndOutcomeResult'

const testData = new TestData()
context('Punishment - number of days', () => {
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
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          outcomes: [
            {
              outcome: {
                outcome: testData.outcome({}),
              },
            },
          ] as OutcomeHistory,
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.punishmentNumberOfDays.urls.start('100'))
      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.submitButton().should('exist')
      punishmentNumberOfDaysPage.cancelButton().should('exist')
      punishmentNumberOfDaysPage.days().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentNumberOfDays.urls.start('100'))
      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no days entered', () => {
      cy.visit(adjudicationUrls.punishmentNumberOfDays.urls.start('100'))
      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)
      punishmentNumberOfDaysPage.submitButton().click()

      punishmentNumberOfDaysPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter how many days the punishment will last')
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it('should save when days entered', () => {
      cy.visit(adjudicationUrls.punishmentNumberOfDays.urls.start('100'))
      const punishmentNumberOfDaysPage = Page.verifyOnPage(PunishmentNumberOfDaysPage)

      punishmentNumberOfDaysPage.days().type('10')
      punishmentNumberOfDaysPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentIsSuspended.urls.start('100'))
      })
    })
  })
})
