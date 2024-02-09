import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HearingReferralConfirmation from '../pages/hearingReferralConfirmation'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

context('Referral saved', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
      const hearingReferralConfirmationPage = Page.verifyOnPage(HearingReferralConfirmation)
      hearingReferralConfirmationPage
        .panelSubText()
        .should('contain', 'You must complete the referral using the usual process')
      hearingReferralConfirmationPage.heading1().should('contain', 'What you need to do next')
      hearingReferralConfirmationPage.para1().should('contain', 'Complete the referral using your usual process.')
      hearingReferralConfirmationPage.heading2().should('contain', 'When the outcome is known')
      hearingReferralConfirmationPage.para2().should('contain', 'To record the outcome of the referral:')
      hearingReferralConfirmationPage
        .list()
        .find('li')
        .then($bullet => {
          expect($bullet.get(0).innerText).to.contain(`Go to 'View all reports'.`)
          expect($bullet.get(1).innerText).to.contain(`Find the relevant report.`)
          expect($bullet.get(2).innerText).to.contain(`Go to the 'Hearings and referrals' tab.`)
          expect($bullet.get(3).innerText).to.contain(`Enter the result of the referral.`)
        })
    })
    it('goes to hearing details page when link is clicked', () => {
      cy.visit(adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
      const hearingReferralConfirmationPage = Page.verifyOnPage(HearingReferralConfirmation)
      hearingReferralConfirmationPage.returnLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })
})
