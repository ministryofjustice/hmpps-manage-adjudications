import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import PoliceReasonForReferral from '../pages/policeReasonForReferral'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()
context('What is the reason for the referral?', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubCreateProsecution', {
      adjudicationNumber: 100,
      hearingId: 1,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.start(100))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.referralReason().should('exist')
      policeReasonForReferralPage.submitButton().should('exist')
      policeReasonForReferralPage.cancelButton().should('exist')
      policeReasonForReferralPage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.start(100))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the referral confirmation page if data successfully submitted', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.start(100))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.referralReason().type("This is the reason I'm referring this case to the police.")
      policeReasonForReferralPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReferralConfirmation.urls.start(100))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason missing', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.start(100))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.submitButton().click()
      policeReasonForReferralPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the reason for the referral')
        })
    })
  })
})
