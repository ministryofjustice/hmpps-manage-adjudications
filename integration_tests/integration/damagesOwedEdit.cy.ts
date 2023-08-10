import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import DamagesOwedPage from '../pages/damagesOwed'
import {
  HearingOutcomeCode,
  HearingOutcomeFinding,
  HearingOutcomePlea,
  OutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

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
    cy.task('stubGetReportedAdjudicationV1', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '1524493',
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-01-23T17:00:00',
              id: 1,
              locationId: 775,
              outcome: testData.hearingOutcome({
                code: HearingOutcomeCode.COMPLETE,
                optionalItems: { plea: HearingOutcomePlea.GUILTY, finding: HearingOutcomeFinding.CHARGE_PROVED },
              }),
            }),
          ],
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                  caution: true,
                  amount: 100.5,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudicationV1', {
      id: '101',
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '1524493',
          prisonerNumber: 'G6415GD',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-01-23T17:00:00',
              id: 1,
              locationId: 775,
              outcome: testData.hearingOutcome({
                code: HearingOutcomeCode.COMPLETE,
                optionalItems: { plea: HearingOutcomePlea.GUILTY, finding: HearingOutcomeFinding.CHARGE_PROVED },
              }),
            }),
          ],
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                  caution: true,
                  amount: null,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.signIn()
  })
  describe('Loads', () => {
    it('should contain the required page elements with amount owed present', () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.edit('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.submitButton().should('exist')
      damagesOwedPage.cancelButton().should('exist')
      damagesOwedPage.damagesOwedRadioButtons().should('exist')
      damagesOwedPage.amount().should('exist')
      damagesOwedPage.amount().should('have.value', '100.50')
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="yes"]').should('be.checked')
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="no"]').should('not.be.checked')
    })
    it('should contain the required page elements with no amount owed present', () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.edit('101'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.submitButton().should('exist')
      damagesOwedPage.cancelButton().should('exist')
      damagesOwedPage.damagesOwedRadioButtons().should('exist')
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="yes"]').should('not.be.checked')
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="no"]').should('be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.edit('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
  })

  describe('Validation', () => {
    it(`error when no amount entered`, () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.edit('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="yes"]').check()
      damagesOwedPage.amount().clear()
      damagesOwedPage.submitButton().click()

      damagesOwedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter amount being recovered')
        })
    })
    it(`error when amount is not numeric entered`, () => {
      cy.visit(adjudicationUrls.moneyRecoveredForDamages.urls.edit('100'))
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="yes"]').check()
      damagesOwedPage.amount().clear()
      damagesOwedPage.amount().type('1t3.4')
      damagesOwedPage.submitButton().click()

      damagesOwedPage
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter the amount in numbers')
        })
    })
  })

  describe('submit', () => {
    it('saves successfully when damages owed', () => {
      cy.visit(`${adjudicationUrls.moneyRecoveredForDamages.urls.edit('100')}`)
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)

      damagesOwedPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isThisACaution.urls.edit('100'))
        expect(loc.search).to.eq('?adjudicator=&plea=&amount=100.50&damagesOwed=true')
      })
    })

    it('saves successfully when damages not owed', () => {
      cy.visit(`${adjudicationUrls.moneyRecoveredForDamages.urls.edit('100')}`)
      const damagesOwedPage = Page.verifyOnPage(DamagesOwedPage)
      damagesOwedPage.damagesOwedRadioButtons().find('input[value="no"]').check()
      damagesOwedPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isThisACaution.urls.edit('100'))
        expect(loc.search).to.eq('?adjudicator=&plea=&amount=&damagesOwed=false')
      })
    })
  })
})
