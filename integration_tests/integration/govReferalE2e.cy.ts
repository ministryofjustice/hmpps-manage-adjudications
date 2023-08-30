import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import EnterHearingOutcomePage from '../pages/enterHearingOutcome'
import HearingReferralConfirmation from '../pages/hearingReferralConfirmation'
import HearingTabPage from '../pages/hearingTab'
import NextStepsGovPage from '../pages/nextStepsGov'
import NotProceedPage from '../pages/notProceed'

import TestData from '../../server/routes/testutils/testData'
import {
  HearingOutcomeCode,
  NotProceedReason,
  OutcomeCode,
  OutcomeHistory,
  ReferralOutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'
import { OicHearingType, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Enter hearing outcome', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    // Staff Member
    cy.task('stubGetUserFromNames', {
      staffFirstName: 'John',
      staffLastName: 'Smith',
      response: [testData.staffFromName()],
    })
    // Staff Member
    cy.task('stubGetUserFromUsername', {
      username: 'JSMITH_GEN',
      response: testData.userFromUsername('JSMITH_GEN'),
    })
    cy.task('stubGetEmail', {
      username: 'JSMITH_GEN',
      response: testData.emailFromUsername('JSMITH_GEN'),
    })
    cy.task('stubUserRoles', [{ roleCode: 'ADJUDICATIONS_REVIEWER' }])
    cy.task('stubGetReportedAdjudication', {
      id: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2030-01-04T09:00:00',
                id: 987,
                locationId: 123,
                oicHearingType: OicHearingType.INAD_ADULT,
              }),
            },
          ] as OutcomeHistory,
          status: ReportedAdjudicationStatus.SCHEDULED,
        }),
      },
    })
    cy.task('stubCreateReferral', {
      chargeNumber: 100,
      hearingId: 987,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetLocation', {
      locationId: 123,
      response: {
        locationId: 123,
        agencyId: 'MDI',
        userDescription: 'Adj 1',
      },
    })
    cy.task('stubCreateNotProceed', {
      chargeNumber: 100,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '100',
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    // cy.task('stubGetReportedAdjudication', {
    //   id: 101,
    //   response: {
    //     reportedAdjudication: testData.reportedAdjudication({
    //       chargeNumber: '101',
    //       prisonerNumber: 'G6415GD',
    //       outcomes: [
    //         {
    //           hearing: testData.singleHearing({
    //             dateTimeOfHearing: '2030-01-04T09:00:00',
    //             id: 987,
    //             locationId: 123,
    //             oicHearingType: OicHearingType.INAD_ADULT,
    //           }),
    //         },
    //       ] as OutcomeHistory,
    //       status: ReportedAdjudicationStatus.SCHEDULED,
    //     }),
    //   },
    // })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })

    cy.signIn()
  })
  describe('IA hearing who refers to gov', () => {
    it('should contain the required page elements - governor hearing', () => {
      cy.visit(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      const enterHearingOutcomePage = Page.verifyOnPage(EnterHearingOutcomePage)
      enterHearingOutcomePage.inAdName().type('John Smith')
      enterHearingOutcomePage.radioButtons().find('input[value="REFER_GOV"]').check()
      enterHearingOutcomePage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingReasonForReferral.urls.start('100'))
        expect(loc.search).to.eq('?adjudicator=John%20Smith&hearingOutcome=REFER_GOV')
      })
      cy.get('h1').contains('What is the reason for not having an independent adjudicator hearing?')
      cy.get('[data-qa="referral-reason"]').type('This is my reasoning for referring to the governor')
      cy.get('[data-qa="reason-for-referral-submit"]').click()
      const hearingReferralConfirmation = Page.verifyOnPage(HearingReferralConfirmation)
      cy.task('stubGetReportedAdjudication', {
        id: 100,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '100',
            prisonerNumber: 'G6415GD',
            outcomes: [
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2030-01-04T09:00:00',
                  id: 987,
                  locationId: 123,
                  oicHearingType: OicHearingType.INAD_ADULT,
                  outcome: testData.hearingOutcome({
                    code: HearingOutcomeCode.REFER_GOV,
                    adjudicator: 'John Smith',
                    optionalItems: {
                      details: 'This is my reasoning for referring to the governor',
                    },
                  }),
                }),
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.REFER_GOV,
                    details: 'This is my reasoning for referring to the governor',
                  }),
                },
              },
            ],
            status: ReportedAdjudicationStatus.REFER_GOV,
          }),
        },
      })
      hearingReferralConfirmation.returnLink().click()
      const hearingTabPage = Page.verifyOnPage(HearingTabPage)
      hearingTabPage.nextStepReferralOutcomeButton().click()
      const nextStepsGovPage = Page.verifyOnPage(NextStepsGovPage)
      nextStepsGovPage.nextStepRadioButtons().find('input[value="not_proceed"]').click()
      nextStepsGovPage.submitButton().click()
      const notProceedPage = Page.verifyOnPage(NotProceedPage)
      notProceedPage.notProceedReason().select('Resolved in another way')
      notProceedPage.notProceedDetails().type('This was resolved with a conversation')
      cy.task('stubGetReportedAdjudication', {
        id: 100,
        response: {
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '100',
            prisonerNumber: 'G6415GD',
            outcomes: [
              {
                hearing: testData.singleHearing({
                  dateTimeOfHearing: '2030-01-04T09:00:00',
                  id: 987,
                  locationId: 123,
                  oicHearingType: OicHearingType.INAD_ADULT,
                  outcome: testData.hearingOutcome({
                    code: HearingOutcomeCode.REFER_GOV,
                    adjudicator: 'John Smith',
                    optionalItems: {
                      details: 'This is my reasoning for referring to the governor',
                    },
                  }),
                }),
                outcome: {
                  outcome: testData.outcome({
                    code: OutcomeCode.REFER_GOV,
                    details: 'This is my reasoning for referring to the governor',
                  }),
                  referralOutcome: testData.referralOutcome({
                    code: ReferralOutcomeCode.NOT_PROCEED,
                    details: 'This was resolved with a conversation',
                    reason: NotProceedReason.ANOTHER_WAY,
                  }),
                },
              },
            ],
            status: ReportedAdjudicationStatus.NOT_PROCEED,
          }),
        },
      })
      notProceedPage.submitButton().click()
      hearingTabPage
        .hearingSummaryTable(1)
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('4 January 2030 - 09:00')
          expect($summaryData.get(1).innerText).to.contain('Adj 1, Moorland (HMP & YOI)')
          expect($summaryData.get(2).innerText).to.contain('Independent Adjudicator')
          expect($summaryData.get(3).innerText).to.contain('J. Smith')
          expect($summaryData.get(4).innerText).to.contain('Refer this case to the governor')
        })
      hearingTabPage.outcomeTableTitle().contains('Governor referral')
      hearingTabPage
        .govReferralTable()
        .find('dt')
        .then($summaryLabel => {
          expect($summaryLabel.get(0).innerText).to.contain(
            'What is the reason for not having an independent adjudicator hearing?'
          )
        })
      hearingTabPage
        .govReferralTable()
        .find('dd')
        .then($summaryData => {
          expect($summaryData.get(0).innerText).to.contain('This is my reasoning for referring to the governor')
        })
    })
  })
})
