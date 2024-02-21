import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HearingPleaAndFinding from '../pages/hearingPleaAndFinding'
import TestData from '../../server/routes/testutils/testData'
import {
  HearingOutcomeCode,
  HearingOutcomePlea,
  OutcomeCode,
  OutcomeHistory,
} from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Plea and finding', () => {
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
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-01-23T17:00:00',
                id: 1,
                locationId: 775,
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                  optionalItems: { plea: HearingOutcomePlea.GUILTY },
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
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
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.edit('100'))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().should('exist')
      hearingPleaAndFindingPage.findingRadioButtons().should('exist')
      hearingPleaAndFindingPage.submitButton().should('exist')
      hearingPleaAndFindingPage.cancelButton().should('exist')
      hearingPleaAndFindingPage.errorSummary().should('not.exist')
    })
    it('should have the previously selected radios selected', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.edit('100'))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="GUILTY"]').should('be.checked')
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="CHARGE_PROVED"]').should('be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.edit('100'))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the money recovered for damages page if data successfully submitted - nothing changed', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit('100')}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingsCheckAnswers.urls.edit('100'))
      })
    })
    it('goes to the reason for finding page if data successfully submitted - change finding radio button to DISMISSED', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit('100')}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="NOT_GUILTY"]').click({ force: true })
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="DISMISSED"]').click({ force: true })
      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForFinding.urls.edit('100'))
      })
    })
    it('goes to the reason for not proceeding page if data successfully submitted - change finding radio button to NOT_PROCEED', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit('100')}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="UNFIT"]').click({ force: true })
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="NOT_PROCEED"]').click({ force: true })
      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.completeHearingEdit('100'))
      })
    })
  })
})
