import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import CheckPunishments from '../pages/checkPunishments'
import Page from '../pages/page'
import { forceDateInputWithDate } from '../componentDrivers/dateInput'

const testData = new TestData()

context('Check punishments', () => {
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
      id: 123,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 123,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
          punishments: [],
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements - nothing in session', () => {
      cy.visit(adjudicationUrls.checkPunishments.urls.start(123))
      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)

      checkPunishmentsPage.emptyState().should('exist')
      checkPunishmentsPage.cancelLink().should('exist')
      checkPunishmentsPage.changePunishmentsLink().should('exist')
      checkPunishmentsPage.submitButton().should('not.exist')
      checkPunishmentsPage.punishmentsTable().should('not.exist')
    })
    it('should go to award punishments page if change link is clicked', () => {
      cy.visit(adjudicationUrls.checkPunishments.urls.start(123))
      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)
      checkPunishmentsPage.changePunishmentsLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified(123))
      })
    })
    it('should go to hearings page if the cancel link is clicked', () => {
      cy.visit(adjudicationUrls.checkPunishments.urls.start(123))
      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)
      checkPunishmentsPage.cancelLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(123))
      })
    })
    it('should show the data in the session when punishments are present', () => {
      cy.visit(adjudicationUrls.awardPunishments.urls.start(123))
      cy.get('[data-qa="add-new-punishment-button"]').click()
      cy.get('#punishmentType-3').click()
      cy.get('[data-qa="punishment-submit"]').click()
      cy.get('#days').type('5')
      cy.get('#suspended').click()
      const today = new Date()
      forceDateInputWithDate(today, '[data-qa="suspended-until-date-picker"]')
      cy.get('[data-qa="punishment-schedule-submit"]').click()
      cy.get('[data-qa="punishments-continue').click()
      const checkPunishmentsPage: CheckPunishments = Page.verifyOnPage(CheckPunishments)
      checkPunishmentsPage.punishmentsTable().should('exist')
      checkPunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Cellular confinement')
          expect($summaryData.get(1).innerText).to.contain('-')
          expect($summaryData.get(2).innerText).to.contain('-')
          expect($summaryData.get(3).innerText).to.contain('5')
          expect($summaryData.get(4).innerText).to.contain('11 Apr 2023')
          expect($summaryData.get(5).innerText).to.contain('-')
          //   TODO Carry on here...
        })
    })
  })
})
