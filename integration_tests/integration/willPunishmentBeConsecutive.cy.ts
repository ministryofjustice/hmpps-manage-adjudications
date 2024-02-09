import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import WillPunishmentBeConsectivePage from '../pages/willPunishmentBeConsective'

const testData = new TestData()
context('Will this punishment be consecutive to another one?', () => {
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
          dateTimeOfIncident: '2022-11-15T09:10:00',
          handoverDeadline: '2022-11-17T09:30:00',
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
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.isPunishmentConsecutive.urls.start('100'))
      const willPunishmentBeConsectivePage = Page.verifyOnPage(WillPunishmentBeConsectivePage)
      willPunishmentBeConsectivePage.submitButton().should('exist')
      willPunishmentBeConsectivePage.cancelButton().should('exist')
      willPunishmentBeConsectivePage.consecutive().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.isPunishmentConsecutive.urls.start('100'))
      const willPunishmentBeConsectivePage = Page.verifyOnPage(WillPunishmentBeConsectivePage)
      willPunishmentBeConsectivePage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
  describe('Validation', () => {
    it('should error when no consecutive option selected', () => {
      cy.visit(adjudicationUrls.isPunishmentConsecutive.urls.start('100'))
      const willPunishmentBeConsectivePage = Page.verifyOnPage(WillPunishmentBeConsectivePage)
      willPunishmentBeConsectivePage.submitButton().click()
      willPunishmentBeConsectivePage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain(
            'Select yes if this punishment is consecutive to another punishment'
          )
        })
    })
  })

  describe('saves successfully and redirects', () => {
    it('redirects if the user selects no', () => {
      cy.visit(adjudicationUrls.isPunishmentConsecutive.urls.start('100'))
      const willPunishmentBeConsectivePage = Page.verifyOnPage(WillPunishmentBeConsectivePage)
      willPunishmentBeConsectivePage.consecutive().find('input[value="no"]').check()
      willPunishmentBeConsectivePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
    it('the page redirects to the next page if the user selects yes', () => {
      cy.visit(adjudicationUrls.isPunishmentConsecutive.urls.start('100'))
      const willPunishmentBeConsectivePage = Page.verifyOnPage(WillPunishmentBeConsectivePage)
      willPunishmentBeConsectivePage.consecutive().find('input[value="yes"]').check()
      willPunishmentBeConsectivePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.start('100'))
      })
    })
  })
})
