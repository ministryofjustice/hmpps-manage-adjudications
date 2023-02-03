import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import HearingPleaAndFinding from '../pages/hearingPleaAndFinding'
import TestData from '../../server/routes/testutils/testData'

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
    cy.task('stubCreateHearingOutcome', {
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
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100, 1))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().should('exist')
      hearingPleaAndFindingPage.findingRadioButtons().should('exist')
      hearingPleaAndFindingPage.submitButton().should('exist')
      hearingPleaAndFindingPage.cancelButton().should('exist')
      hearingPleaAndFindingPage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100, 1))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the money recovered for damages page if data successfully submitted', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.start(
          100,
          1
        )}?adjudicatorName=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="PROVED"]').click()
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="GUILTY"]').click()

      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      })
    })
    it('goes back to the enter hearing outcome page if the adjudicator name and hearing outcome code is missing', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100, 1))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="PROVED"]').click()
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="GUILTY"]').click()
      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.enterHearingOutcome.urls.start(100, 1))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if plea missing', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100, 1))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="PROVED"]').click()
      hearingPleaAndFindingPage.submitButton().click()
      hearingPleaAndFindingPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select a plea')
        })
    })
    it('shows correct error message if finding missing', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100, 1))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="GUILTY"]').click()
      hearingPleaAndFindingPage.submitButton().click()
      hearingPleaAndFindingPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select a finding')
        })
    })
  })
})
