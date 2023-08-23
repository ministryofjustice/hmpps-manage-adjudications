import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ReasonForChangePunishmentPage from '../pages/reasonForChangePunishment'
import { forceDateInputWithDate } from '../componentDrivers/dateInput'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PunishmentType } from '../../server/data/PunishmentResult'

const testData = new TestData()
context('What is the reason for this change', () => {
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
              dateTimeOfHearing: '2024-11-23T17:00:00',
              id: 68,
            }),
          ],
          punishments: [
            {
              id: 14,
              type: PunishmentType.CONFINEMENT,
              schedule: {
                days: 5,
                suspendedUntil: '2023-04-13',
              },
            },
          ],
        }),
      },
    })

    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.reasonForChangePunishment.urls.start('100'))
      const reasonForChangePunishmentPage = Page.verifyOnPage(ReasonForChangePunishmentPage)
      reasonForChangePunishmentPage.radios().should('exist')
      reasonForChangePunishmentPage.details().should('exist')
      reasonForChangePunishmentPage.submitButton().should('exist')
      reasonForChangePunishmentPage.cancelLink().should('exist')
      reasonForChangePunishmentPage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to punishment and damages page', () => {
      cy.visit(adjudicationUrls.reasonForChangePunishment.urls.start('100'))
      const reasonForChangePunishmentPage = Page.verifyOnPage(ReasonForChangePunishmentPage)
      reasonForChangePunishmentPage.cancelLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('100'))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the check your answers punishment page if data successfully submitted', () => {
      // Need to set up a punishment in the session first
      cy.visit(adjudicationUrls.awardPunishments.urls.modified('100'))
      cy.get('[data-qa="add-new-punishment-button"]').click()
      cy.get('#punishmentType-4').click()
      cy.get('#stoppagePercentage').type('25')
      cy.get('[data-qa="punishment-submit"]').click()
      cy.get('#days').type('2')
      cy.get('#suspended-2').click()
      const date = new Date('2023-04-13')
      const date2 = new Date('2023-04-15')
      forceDateInputWithDate(date, '[data-qa="start-date-picker"]')
      forceDateInputWithDate(date2, '[data-qa="end-date-picker"]')
      cy.get('[data-qa="punishment-schedule-submit"]').click()
      cy.get('[data-qa="punishments-continue').click()

      const reasonForChangePunishmentPage = Page.verifyOnPage(ReasonForChangePunishmentPage)
      reasonForChangePunishmentPage.radios().find('input[value="CORRECTION"]').click()
      reasonForChangePunishmentPage.details().type('Some reason')
      reasonForChangePunishmentPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.checkPunishments.urls.submittedEdit('100'))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason is missing', () => {
      cy.visit(adjudicationUrls.reasonForChangePunishment.urls.start('100'))
      const reasonForChangePunishmentPage = Page.verifyOnPage(ReasonForChangePunishmentPage)
      reasonForChangePunishmentPage.submitButton().click()
      reasonForChangePunishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select a reason')
        })
    })
    it('shows correct error message if details are missing', () => {
      cy.visit(adjudicationUrls.reasonForChangePunishment.urls.start('100'))
      const reasonForChangePunishmentPage = Page.verifyOnPage(ReasonForChangePunishmentPage)
      reasonForChangePunishmentPage.radios().find('input[value="CORRECTION"]').click()
      reasonForChangePunishmentPage.submitButton().click()
      reasonForChangePunishmentPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter more details')
        })
    })
  })
})
