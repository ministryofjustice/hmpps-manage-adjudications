import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentsAndDamagesPage from '../pages/punishmentsAndDamages'
import {
  HearingOutcomeCode,
  HearingOutcomeFinding,
  HearingOutcomePlea,
  OutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Damages and punishments summary', () => {
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
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubPostCompleteHearingChargeProved', {
      adjudicationNumber: 100,
      response: {},
    })
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 1524493,
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
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
                  amount: 100.5,
                  caution: true,
                }),
              },
            },
          ],
        }),
      },
    })
  })

  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      const punishmentsAndDamagesPage = Page.verifyOnPage(PunishmentsAndDamagesPage)
      punishmentsAndDamagesPage.moneyCautionSummary().should('exist')
      punishmentsAndDamagesPage.punishmentsTabName().contains('Punishments and damages')

      punishmentsAndDamagesPage
        .moneyCautionSummary()
        .find('dt')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Is any money being recovered for damages?')
          expect($summaryData.get(1).innerText).to.contain('Is the punishment a caution?')
        })
      punishmentsAndDamagesPage
        .moneyCautionSummary()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Yes: £100.50')
          expect($summaryData.get(2).innerText).to.contain('Yes')
        })
    })
  })

  describe('change links', () => {
    it('should got to money recovered edit', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      cy.get('[data-qa="change-link"').first().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.moneyRecoveredForDamages.urls.edit(1524493))
      })
    })
    it('should got to is caution edit', () => {
      cy.visit(adjudicationUrls.punishmentsAndDamages.urls.review(100))
      cy.get('[data-qa="change-link"').eq(1).click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.isThisACaution.urls.edit(1524493))
      })
    })
  })
})
