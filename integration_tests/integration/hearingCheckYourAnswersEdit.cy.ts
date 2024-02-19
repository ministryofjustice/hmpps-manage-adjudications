import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import HearingCheckAnswersPage from '../pages/hearingCheckYourAnswers'
import {
  HearingOutcomeCode,
  HearingOutcomeFinding,
  HearingOutcomePlea,
  OutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { PunishmentDataWithSchedule } from '../../server/data/PunishmentResult'

const testData = new TestData()

context('Check your answers before submitting', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.signIn()
    cy.task('stubPostCompleteHearingChargeProved', {
      chargeNumber: 100,
      response: {},
    })
    cy.task('stubGetReportedAdjudication', {
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
                }),
              },
            },
          ],
          punishments: [{} as PunishmentDataWithSchedule],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '1524493',
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
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubAmendHearingOutcome', {
      chargeNumber: '100',
      status: ReportedAdjudicationStatus.CHARGE_PROVED,
      response: {},
    })
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(
        `${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?adjudicator=JGREEN&plea=GUILTY&finding=CHARGE_PROVED`
      )
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.submitButton().should('exist')
      checkAnswersPage.cancelLink().should('exist')
      checkAnswersPage.answersTable().should('exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(
        `${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?adjudicator=JGREEN&plea=GUILTY&finding=CHARGE_PROVED`
      )
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.cancelLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
    it('shows the correct information in the summary table', () => {
      cy.visit(
        `${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?adjudicator=JGREEN&plea=GUILTY&finding=CHARGE_PROVED`
      )
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage
        .answersTable()
        .get('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Plea')
          expect($summaryLabels.get(1).innerText).to.contain('Finding')
        })
      checkAnswersPage
        .answersTable()
        .get('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Guilty')
          expect($summaryData.get(2).innerText).to.contain('Charge proved beyond reasonable doubt')
        })
    })
  })

  describe('saves', () => {
    it('should submit successful', () => {
      cy.visit(
        `${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?adjudicator=JGREEN&plea=GUILTY&finding=CHARGE_PROVED`
      )
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.modified('100'))
      })
    })
  })
})
