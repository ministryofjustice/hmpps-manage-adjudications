import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import PoliceReasonForReferral from '../pages/policeReasonForReferral'
import TestData from '../../server/routes/testutils/testData'
import { OutcomeHistory } from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

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
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.REFER_POLICE,
          outcomes: [
            {
              outcome: {
                outcome: testData.outcome({}),
              },
            },
          ] as OutcomeHistory,
        }),
      },
    })
    cy.task('stubAmendOutcome', {
      chargeNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              outcome: {
                outcome: testData.outcome({
                  details: 'This is an amended reason',
                }),
              },
            },
          ] as OutcomeHistory,
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.edit('100'))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.referralReason().should('exist')
      policeReasonForReferralPage.submitButton().should('exist')
      policeReasonForReferralPage.cancelButton().should('exist')
      policeReasonForReferralPage.errorSummary().should('not.exist')
    })
    it('should render existing data', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.edit('100'))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.referralReason().contains('Some details')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.edit('100'))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the referral confirmation page if data successfully submitted', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.edit('100'))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.referralReason().type('This is an amended reason')
      policeReasonForReferralPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason missing', () => {
      cy.visit(adjudicationUrls.reasonForReferral.urls.edit('100'))
      const policeReasonForReferralPage = Page.verifyOnPage(PoliceReasonForReferral)
      policeReasonForReferralPage.referralReason().clear()
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
