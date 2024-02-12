import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentStartDatePage from '../pages/punishmentStartDate'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { formatDateForDatePicker } from '../../server/utils/utils'

const testData = new TestData()
context('Punishment - Enter the date the punishment will start', () => {
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
      cy.visit(adjudicationUrls.punishmentStartDate.urls.start('100'))
      const punishmentStartDatePage = Page.verifyOnPage(PunishmentStartDatePage)
      punishmentStartDatePage.submitButton().should('exist')
      punishmentStartDatePage.cancelButton().should('exist')
      punishmentStartDatePage.datepicker().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentStartDate.urls.start('100'))
      const punishmentStartDatePage = Page.verifyOnPage(PunishmentStartDatePage)
      punishmentStartDatePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no date is selected', () => {
      cy.visit(adjudicationUrls.punishmentStartDate.urls.start('100'))
      const punishmentStartDatePage = Page.verifyOnPage(PunishmentStartDatePage)
      punishmentStartDatePage.submitButton().click()
      punishmentStartDatePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the date the punishment will start')
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it('should go to correct page when date is entered', () => {
      cy.visit(
        `${adjudicationUrls.punishmentStartDate.urls.start('100')}?punishmentType=PRIVILEGES&privilegeType=TV&days=10`
      )
      const punishmentStartDatePage = Page.verifyOnPage(PunishmentStartDatePage)
      const date = formatDateForDatePicker(new Date('10/10/2030').toISOString(), 'short')
      punishmentStartDatePage.datepicker().type(date)
      punishmentStartDatePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentAutomaticDateSchedule.urls.start('100'))
      })
    })
  })
})
