import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ActivePunishmentsPage from '../pages/activePunishments'
import { PunishmentType } from '../../server/data/PunishmentResult'

const testData = new TestData()

context('Display active punishments', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.signIn()

    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
  })
  describe('Active punishments page', () => {
    it('displays message when data is not present', () => {
      cy.task('stubPrisonerActivePunishments', {
        bookingId: '123',
        response: [],
      })
      cy.visit(adjudicationUrls.activePunishments.urls.start('G6415GD'))
      const activePunishmentsPage = Page.verifyOnPage(ActivePunishmentsPage)
      activePunishmentsPage.pageTitle().should('contain', 'John Smith’s active punishments')
      activePunishmentsPage
        .noPunishments()
        .should('contain', 'There are currently no active punishments or damages for this prisoner.')
      activePunishmentsPage.punishmentsTable().should('not.exist')
      activePunishmentsPage.link().should('exist')
      activePunishmentsPage.link().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.adjudicationHistory.urls.start('G6415GD'))
      })
    })
    it('Displays table of information when data is present', () => {
      cy.task('stubPrisonerActivePunishments', {
        bookingId: '123',
        response: [
          {
            chargeNumber: 1,
            punishmentType: PunishmentType.DAMAGES_OWED,
            startDate: '2024-01-10',
            amount: 40,
          },
          {
            chargeNumber: 1,
            punishmentType: PunishmentType.CONFINEMENT,
            duration: 10,
            startDate: '2024-01-10',
            lastDay: '2024-01-20',
          },
          {
            chargeNumber: 1,
            punishmentType: PunishmentType.EARNINGS,
            duration: 10,
            startDate: '2024-01-10',
            lastDay: '2024-01-20',
            stoppagePercentage: 20,
          },
        ],
      })

      cy.visit(adjudicationUrls.activePunishments.urls.start('G6415GD'))
      const activePunishmentsPage = Page.verifyOnPage(ActivePunishmentsPage)
      activePunishmentsPage.pageTitle().should('contain', 'John Smith’s active punishments')
      activePunishmentsPage.noPunishments().should('not.exist')

      activePunishmentsPage
        .punishmentsTable()
        .find('th')
        .then($summaryHeader => {
          expect($summaryHeader.get(0).innerText).to.contain('Type') // type of punishment
          expect($summaryHeader.get(1).innerText).to.contain('Start date') // start date
          expect($summaryHeader.get(2).innerText).to.contain('Last day') // last day
          expect($summaryHeader.get(3).innerText).to.contain('Number of days') // number of days
          expect($summaryHeader.get(4).innerText).to.contain('Comments') // comment
          expect($summaryHeader.get(5).innerText).to.contain('Activated from report') // activated from
        })

      activePunishmentsPage
        .punishmentsTable()
        .find('td')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Recovery of money for damages') // type of punishment
          expect($summaryData.get(1).innerText).to.contain('10 Jan 2024') // start date
          expect($summaryData.get(2).innerText).to.contain('-') // last day
          expect($summaryData.get(3).innerText).to.contain('-') // number of days
          expect($summaryData.get(4).innerText).to.contain('£40') // comment
          expect($summaryData.get(5).innerText).to.contain('-') // activated from
          expect($summaryData.get(6).innerText).to.contain('Cellular confinement') // type of punishment
          expect($summaryData.get(7).innerText).to.contain('10 Jan 2024') // start date
          expect($summaryData.get(8).innerText).to.contain('20 Jan 2024') // last day
          expect($summaryData.get(9).innerText).to.contain('10') // number of days
          expect($summaryData.get(10).innerText).to.contain('-') // comment
          expect($summaryData.get(11).innerText).to.contain('-') // activated from
          expect($summaryData.get(12).innerText).to.contain('Stoppage of earnings: 20%') // type of punishment
          expect($summaryData.get(13).innerText).to.contain('10 Jan 2024') // start date
          expect($summaryData.get(14).innerText).to.contain('20 Jan 2024') // last day
          expect($summaryData.get(15).innerText).to.contain('10') // number of days
          expect($summaryData.get(16).innerText).to.contain('-') // comment
          expect($summaryData.get(17).innerText).to.contain('-') // activated from
        })
    })
  })
})
