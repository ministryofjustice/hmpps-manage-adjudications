import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ActivePunishmentsPage from '../pages/activePunishments'

const testData = new TestData()

context.skip('Display active punishments', () => {
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
      cy.visit(adjudicationUrls.activePunishments.urls.start('100'))
      const activePunishmentsPage = Page.verifyOnPage(ActivePunishmentsPage)
      activePunishmentsPage.pageTitle().should('contain', "John Smith's active punishments")
      activePunishmentsPage
        .noPunishments()
        .should('contain', 'There are currently no active punishments or damages for this prisoner.')
      activePunishmentsPage.punishmentsTable().should('not.exist')
      activePunishmentsPage.link().should('exist')
      activePunishmentsPage.link().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.adjudicationHistory.root)
      })
    })
    it('Displays table of information when data is present', () => {
      cy.visit(adjudicationUrls.activePunishments.urls.start('100'))
      const activePunishmentsPage = Page.verifyOnPage(ActivePunishmentsPage)
      activePunishmentsPage.pageTitle().should('contain', "John Smith's active punishments")
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
          expect($summaryData.get(0).innerText).to.contain('-') // type of punishment
          expect($summaryData.get(1).innerText).to.contain('-') // start date
          expect($summaryData.get(2).innerText).to.contain('-') // last day
          expect($summaryData.get(3).innerText).to.contain('-') // number of days
          expect($summaryData.get(4).innerText).to.contain('-') // comment
          expect($summaryData.get(5).innerText).to.contain('-') // activated from
        })
      activePunishmentsPage.link().should('exist')
      activePunishmentsPage.link().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.adjudicationHistory.root)
      })
    })
  })
})
