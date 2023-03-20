import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HearingReasonForReferral from '../pages/hearingReasonForReferral'
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
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.REFER_POLICE,
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-01-23T17:00:00',
                id: 1,
                locationId: 775,
                outcome: testData.hearingOutcome({ optionalItems: { details: 'A reason for referral' } }),
              }),
            },
          ] as OutcomeHistory,
        }),
      },
    })
    cy.task('stubAmendHearingOutcome', {
      adjudicationNumber: 100,
      status: ReportedAdjudicationStatus.REFER_POLICE,
      hearingId: 1,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-01-23T17:00:00',
              id: 1,
              locationId: 775,
              outcome: testData.hearingOutcome({ optionalItems: { details: 'A reason for referral - altered' } }),
            }),
          ],
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.hearingReasonForReferral.urls.edit(100))
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.referralReason().should('exist')
      hearingReasonForReferralPage.submitButton().should('exist')
      hearingReasonForReferralPage.cancelButton().should('exist')
      hearingReasonForReferralPage.errorSummary().should('not.exist')
    })
    it('should have preloaded values from api call', () => {
      cy.visit(adjudicationUrls.hearingReasonForReferral.urls.edit(100))
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.referralReason().should('have.value', 'A reason for referral')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingReasonForReferral.urls.edit(100))
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the referral confirmation page if data successfully submitted - queries present - nothing changed', () => {
      cy.visit(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100
        )}?adjudicator=Judge%20Red&hearingOutcome=REFER_POLICE`
      )
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReferralConfirmation.urls.start(100))
      })
    })
    it('goes to the referral confirmation page if data successfully submitted - queries not present - nothing changed', () => {
      cy.visit(adjudicationUrls.hearingReasonForReferral.urls.edit(100))
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReferralConfirmation.urls.start(100))
      })
    })
    it('goes to the referral confirmation page if data successfully submitted - reason changed', () => {
      cy.visit(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100
        )}?adjudicator=Judge%20Red&hearingOutcome=REFER_POLICE`
      )
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.referralReason().clear()
      hearingReasonForReferralPage.referralReason().type('A reason for referral - altered')
      hearingReasonForReferralPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReferralConfirmation.urls.start(100))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason missing', () => {
      cy.visit(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100
        )}?adjudicator=Judge%20Red&hearingOutcome=REFER_POLICE`
      )
      const hearingReasonForReferralPage = Page.verifyOnPage(HearingReasonForReferral)
      hearingReasonForReferralPage.referralReason().clear()
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
