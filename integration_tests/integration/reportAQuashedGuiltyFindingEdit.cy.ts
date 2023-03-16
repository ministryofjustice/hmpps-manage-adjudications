import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import ReportAQuashedGuiltyFindingPage from '../pages/reportAQuashedGuiltyFinding'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { OutcomeCode, OutcomeHistory, QuashGuiltyFindingReason } from '../../server/data/HearingAndOutcomeResult'

const testData = new TestData()
context('Report a quashed guilty finding', () => {
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
          outcomes: [
            {
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.QUASHED,
                  details: 'First details comment',
                  quashedReason: QuashGuiltyFindingReason.FLAWED_CASE,
                }),
              },
            },
          ] as OutcomeHistory,
        }),
      },
    })
    cy.task('stubAmendOutcome', {
      adjudicationNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 100,
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.QUASHED,
          outcomes: [
            {
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.QUASHED,
                  details: 'New edited details comment',
                  quashedReason: QuashGuiltyFindingReason.APPEAL_UPHELD,
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
      cy.visit(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit(100))
      const reportAQuashedFinding = Page.verifyOnPage(ReportAQuashedGuiltyFindingPage)
      reportAQuashedFinding.quashDetails().should('exist')
      reportAQuashedFinding.submitButton().should('exist')
      reportAQuashedFinding.cancelLink().should('exist')
      reportAQuashedFinding.quashReason().should('exist')
      reportAQuashedFinding.errorSummary().should('not.exist')
    })
    it('should render existing data', () => {
      cy.visit(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit(100))
      const reportAQuashedFinding = Page.verifyOnPage(ReportAQuashedGuiltyFindingPage)
      reportAQuashedFinding.quashReason().should('have.value', 'FLAWED_CASE')
      reportAQuashedFinding.quashDetails().contains('First details comment')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit(100))
      const reportAQuashedFinding = Page.verifyOnPage(ReportAQuashedGuiltyFindingPage)
      reportAQuashedFinding.cancelLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the punishment page page if data successfully submitted', () => {
      cy.visit(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit(100))
      const reportAQuashedFinding = Page.verifyOnPage(ReportAQuashedGuiltyFindingPage)
      reportAQuashedFinding.quashReason().select('Prisoner appeal upheld')
      reportAQuashedFinding.quashDetails().clear().type('New edited details comment')
      reportAQuashedFinding.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if reason missing', () => {
      cy.visit(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit(100))
      const reportAQuashedFinding = Page.verifyOnPage(ReportAQuashedGuiltyFindingPage)
      reportAQuashedFinding.quashReason().select('')
      reportAQuashedFinding.submitButton().click()
      reportAQuashedFinding
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select why the guilty finding was quashed')
        })
    })
    it('shows correct error message if details missing', () => {
      cy.visit(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit(100))
      const reportAQuashedFinding = Page.verifyOnPage(ReportAQuashedGuiltyFindingPage)
      reportAQuashedFinding.quashReason().select('Flawed case')
      reportAQuashedFinding.quashDetails().clear()
      reportAQuashedFinding.submitButton().click()
      reportAQuashedFinding
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter more details')
        })
    })
  })
})
