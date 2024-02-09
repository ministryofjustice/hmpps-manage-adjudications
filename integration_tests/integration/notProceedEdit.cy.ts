import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import NotProceedPage from '../pages/notProceed'
import { OutcomeCode, NotProceedReason } from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Will this charge continue to prosecution?', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.task('stubCreateNotProceed', {
      chargeNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.signIn()
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.NOT_PROCEED,
          hearings: [],
          outcomes: [
            {
              hearing: null,
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.NOT_PROCEED,
                  reason: NotProceedReason.ANOTHER_WAY,
                  details: 'details',
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '101',
          prisonerNumber: 'G6415GD',
          hearings: [],
          outcomes: [
            {
              hearing: null,
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.NOT_PROCEED,
                  details: null,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubAmendOutcome', {
      chargeNumber: 100,
      response: {},
    })
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.edit('100'))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)
      notProceedPage.submitButton().should('exist')
      notProceedPage.cancelButton().should('exist')
      notProceedPage.notProceedDetails().should('exist')
      notProceedPage.notProceedReason().should('exist')
      notProceedPage.notProceedDetails().contains('details')
      notProceedPage.notProceedReason().should('have.value', NotProceedReason.ANOTHER_WAY)
    })
    it('should contain the required page elements when no data', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.edit('101'))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)
      notProceedPage.submitButton().should('exist')
      notProceedPage.cancelButton().should('exist')
      notProceedPage.notProceedDetails().should('exist')
      notProceedPage.notProceedReason().should('exist')
      notProceedPage.notProceedDetails().should('have.value', '')
      notProceedPage.notProceedReason().should('have.value', '')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.edit('100'))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)
      notProceedPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })

  describe('Continue', () => {
    it('redirects to hearing review when saved', () => {
      cy.visit(adjudicationUrls.reasonForNotProceeding.urls.edit('100'))
      const notProceedPage = Page.verifyOnPage(NotProceedPage)

      notProceedPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })
})
