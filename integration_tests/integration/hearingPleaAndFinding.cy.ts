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
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.pleaRadioButtons().should('exist')
      hearingPleaAndFindingPage.findingRadioButtons().should('exist')
      hearingPleaAndFindingPage.submitButton().should('exist')
      hearingPleaAndFindingPage.cancelButton().should('exist')
      hearingPleaAndFindingPage.errorSummary().should('not.exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
  describe('Submits successfully', () => {
    it('goes to the money recovered for damages page if data successfully submitted with PROVED finding', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.start(100)}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="CHARGE_PROVED"]').click()
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="GUILTY"]').click()

      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      })
    })
    it('goes to the reason for finding page if data successfully submitted with DISMISSED finding', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.start(100)}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="DISMISSED"]').click()
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="GUILTY"]').click()

      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForFinding.urls.start(100))
      })
    })
    it('goes to the reason for not proceeding page if data successfully submitted with NOT_PROCEED finding', () => {
      cy.visit(
        `${adjudicationUrls.hearingPleaAndFinding.urls.start(100)}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`
      )
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="NOT_PROCEED"]').click()
      hearingPleaAndFindingPage.pleaRadioButtons().find('input[value="UNFIT"]').click()

      hearingPleaAndFindingPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      })
    })
  })
  describe('Validation', () => {
    it('shows correct error message if plea missing', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100))
      const hearingPleaAndFindingPage = Page.verifyOnPage(HearingPleaAndFinding)
      hearingPleaAndFindingPage.findingRadioButtons().find('input[value="CHARGE_PROVED"]').click()
      hearingPleaAndFindingPage.submitButton().click()
      hearingPleaAndFindingPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select a plea')
        })
    })
    it('shows correct error message if finding missing', () => {
      cy.visit(adjudicationUrls.hearingPleaAndFinding.urls.start(100))
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
