import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HearingReasonForReferral from '../pages/hearingReasonForReferral'
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
    cy.task('stubCreateReferral', {
      chargeNumber: 100,
      hearingId: 1,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.referralReason().should('exist')
      hearingReasonForReferralPage.submitButton().should('exist')
      hearingReasonForReferralPage.cancelButton().should('exist')
      hearingReasonForReferralPage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the referral confirmation page if data successfully submitted', () => {
      cy.visit(
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          '100'
        )}?adjudicator=Judge%20Red&hearingOutcome=REFER_POLICE`
      )
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.referralReason().type("This is the reason I'm referring this case to the police.")
      hearingReasonForReferralPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
      })
    })
    it('goes back to the enter hearing outcome page if the adjudicator name and hearing outcome code is missing', () => {
      cy.visit(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.referralReason().type("This is the reason I'm referring this case to the police.")
      hearingReasonForReferralPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason missing', () => {
      cy.visit(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.submitButton().click()
      hearingReasonForReferralPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the reason for the referral')
        })
    })
  })
})
