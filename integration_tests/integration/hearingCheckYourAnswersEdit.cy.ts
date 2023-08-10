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
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.signIn()
    cy.task('stubPostCompleteHearingChargeProved', {
      chargeNumber: 100,
      response: {},
    })
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
                  caution: true,
                  amount: null,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubAmendHearingOutcome', {
      chargeNumber: 100,
      status: ReportedAdjudicationStatus.CHARGE_PROVED,
      response: {},
    })
  })
  describe('Loads', () => {
    it('should contain the required page elements', () => {
      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?caution=yes`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.submitButton().should('exist')
      checkAnswersPage.cancelLink().should('exist')
      checkAnswersPage.answersTable().should('exist')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?caution=yes`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.cancelLink().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review('100'))
      })
    })
    it('shows the correct information in the summary table - money amount provided', () => {
      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?caution=yes`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage
        .answersTable()
        .get('dt')
        .then($summaryLabels => {
          expect($summaryLabels.get(0).innerText).to.contain('Is any money being recovered for damages?')
          expect($summaryLabels.get(1).innerText).to.contain('Is the punishment a caution?')
        })
      checkAnswersPage
        .answersTable()
        .get('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Yes: £100.50')
          expect($summaryData.get(2).innerText).to.contain('Yes')
        })
    })
    it('shows the correct information in the summary table - money amount not provided', () => {
      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('101')}?caution=yes`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage
        .answersTable()
        .get('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('No')
        })
    })
    it('shows the correct information in the summary table - money provided from previous edit page', () => {
      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?amount=999.99&caution=yes`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage
        .answersTable()
        .get('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('Yes: £999.99')
          expect($summaryData.get(2).innerText).to.contain('Yes')
        })
    })
  })

  describe('saves', () => {
    it('should submit successfully - caution yes', () => {
      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?caution=yes`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('100'))
      })
    })
    it('should submit successfully - caution no', () => {
      cy.task('stubGetReportedAdjudicationV1', {
        id: 100,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '100',
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2022-11-15T09:10:00',
            handoverDeadline: '2022-11-17T09:30:00',
            punishments: [],
          }),
        },
      })

      cy.visit(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?caution=no`)
      const checkAnswersPage = Page.verifyOnPage(HearingCheckAnswersPage)
      checkAnswersPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.awardPunishments.urls.start('100'))
      })
    })
  })
})
