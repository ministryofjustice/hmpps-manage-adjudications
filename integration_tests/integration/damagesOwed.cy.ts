import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import DamagesOwedPage from '../pages/damagesOwed'

const testData = new TestData()
context('Is any money being recovered for damages?', () => {
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
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.submitButton().should('exist')
      damagesOwedPage.cancelButton().should('exist')
      damagesOwedPage.damagesOwedRadioButtons().should('exist')
      damagesOwedPage.amount().should('exist')
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="yes"]').should('not.be.checked')
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="no"]').should('not.be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })

  describe('Validation', () => {
    it(`error when no option selected`, () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.submitButton().click()

      damagesOwedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select yes if any money is being recovered for damages')
        })
    })
    it(`error when no amount entered`, () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="yes"]').check()
      damagesOwedPage.submitButton().click()

      damagesOwedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter amount being recovered')
        })
    })
    it(`error when amount is not numeric entered`, () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.start(100))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="yes"]').check()
      damagesOwedPage.amount().type('1t3.4')
      damagesOwedPage.submitButton().click()

      damagesOwedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Numerical values only')
        })
    })
  })

  describe('submit', () => {
    it('saves successfully when damages owed', () => {
      cy.visit(`${adjudicationUrls.moneyRecoveredForDamages.urls.start(100)}?adjudicator=Tim&plea=GUILTY`)
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="yes"]').check()
      damagesOwedPage.amount().type('123.4')
      damagesOwedPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isThisACaution.urls.start(100))
      })
    })

    it('saves successfully when damages not owed', () => {
      cy.visit(`${adjudicationUrls.moneyRecoveredForDamages.urls.start(100)}?adjudicator=Tim&plea=GUILTY`)
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="no"]').check()
      damagesOwedPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isThisACaution.urls.start(100))
      })
    })
  })
})
