import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HearingPleaAndFinding from '../pages/hearingPleaAndFinding'
import TestData from '../../server/routes/testutils/testData'
import { HearingOutcomeCode, HearingOutcomeFinding, HearingOutcomePlea } from '../../server/data/HearingResult'

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
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-01-23T17:00:00',
              id: 1,
              locationId: 775,
              outcome: testData.hearingOutcome({
                code: HearingOutcomeCode.COMPLETE,
                optionalItems: { plea: HearingOutcomePlea.GUILTY, finding: HearingOutcomeFinding.PROVED },
              }),
            }),
          ],
        }),
      },
    })
    cy.task('stubUpdateHearingOutcome', {
      adjudicationNumber: 100,
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
              outcome: testData.hearingOutcome({
                code: HearingOutcomeCode.COMPLETE,
                optionalItems: { plea: HearingOutcomePlea.GUILTY, finding: HearingOutcomeFinding.PROVED },
              }),
            }),
          ],
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.edit(100, 1))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().should('exist')
      hearingPleaAndFindingPage.findingRadioButtons().should('exist')
      hearingPleaAndFindingPage.submitButton().should('exist')
      hearingPleaAndFindingPage.cancelButton().should('exist')
      hearingPleaAndFindingPage.errorSummary().should('not.exist')
    })
    it('should have the previously selected radios selected', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.edit(100, 1))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="GUILTY"]').should('be.checked')
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="PROVED"]').should('be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.edit(100, 1))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the money recovered for damages page if data successfully submitted - nothing changed', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(
          100,
          1
        )}?adjudicatorName=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.moneyRecoveredForDamages.urls.edit(100))
      })
    })
    it('goes to the reason for finding page if data successfully submitted - change finding radio button to DISMISSED', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(
          100,
          1
        )}?adjudicatorName=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="NOT_GUILTY"]').click()
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="DISMISSED"]').click()
      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForFinding.urls.edit(100, 1))
      })
    })
    it('goes to the reason for not proceeding page if data successfully submitted - change finding radio button to NOT_PROCEED_WITH', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(
          100,
          1
        )}?adjudicatorName=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="UNFIT"]').click()
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="NOT_PROCEED_WITH"]').click()
      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.edit(100))
      })
    })
  })
})
