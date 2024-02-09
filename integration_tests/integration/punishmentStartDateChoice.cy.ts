import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentStartDateChoicePage from '../pages/punishmentStartDateChoice'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Punishment - when will the punishment start?', () => {
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
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-09-02T10:50:00.000Z',
            }),
            testData.singleHearing({
              dateTimeOfHearing: '2023-09-03T12:00:00.000Z',
            }),
          ],
        }),
      },
    })

    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.whenWillPunishmentStart.urls.start('100'))
      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.submitButton().should('exist')
      punishmentStartDateChoicePage.cancelButton().should('exist')
      punishmentStartDateChoicePage.radioButtons().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.whenWillPunishmentStart.urls.start('100'))
      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no option selected', () => {
      cy.visit(adjudicationUrls.whenWillPunishmentStart.urls.start('100'))
      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.submitButton().click()
      punishmentStartDateChoicePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select when this punishment starts')
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it('should go to correct page when punishment starts immediately', () => {
      cy.visit(adjudicationUrls.whenWillPunishmentStart.urls.start('100'))
      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.radioButtons().find('input[value="true"]').check()
      punishmentStartDateChoicePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentAutomaticDateSchedule.urls.start('100'))
      })
    })
    it('should go to correct page when punishment starts on another day', () => {
      cy.visit(adjudicationUrls.whenWillPunishmentStart.urls.start('100'))
      const punishmentStartDateChoicePage = Page.verifyOnPage(PunishmentStartDateChoicePage)
      punishmentStartDateChoicePage.radioButtons().find('input[value="false"]').check()
      punishmentStartDateChoicePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentStartDate.urls.start('100'))
      })
    })
  })
})
