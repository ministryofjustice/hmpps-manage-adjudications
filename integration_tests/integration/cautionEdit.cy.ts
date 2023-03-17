import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import CautionPage from '../pages/caution'
import {
  HearingOutcomeCode,
  HearingOutcomeFinding,
  HearingOutcomePlea,
  OutcomeCode,
} from '../../server/data/HearingAndOutcomeResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const testData = new TestData()
context('Is this punishment a caution?', () => {
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
      adjudicationNumber: 100,
      response: {},
    })
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
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 101,
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
                  caution: false,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 102,
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
                  code: OutcomeCode.DISMISSED,
                }),
              },
            },
          ],
        }),
      },
    })
    cy.task('stubAmendHearingOutcome', {
      adjudicationNumber: 100,
      status: ReportedAdjudicationStatus.CHARGE_PROVED,
      response: {},
    })
  })

  describe('Loads', () => {
    it('should contain the required page elements with yes selected', () => {
      cy.visit(adjudicationUrls.isThisACaution.urls.edit(100))
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.submitButton().should('exist')
      cautionPage.cancelButton().should('exist')
      cautionPage.cautionRadioButtons().should('exist')
      cautionPage.cautionRadioButtons().find('input[value="yes"]').should('be.checked')
      cautionPage.cautionRadioButtons().find('input[value="no"]').should('not.be.checked')
    })
    it('should contain the required page elements with no selected', () => {
      cy.visit(adjudicationUrls.isThisACaution.urls.edit(101))
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.submitButton().should('exist')
      cautionPage.cancelButton().should('exist')
      cautionPage.cautionRadioButtons().should('exist')
      cautionPage.cautionRadioButtons().find('input[value="yes"]').should('not.be.checked')
      cautionPage.cautionRadioButtons().find('input[value="no"]').should('be.checked')
    })
    it('should contain the required page elements with no data selected', () => {
      cy.visit(adjudicationUrls.isThisACaution.urls.edit(102))
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.submitButton().should('exist')
      cautionPage.cancelButton().should('exist')
      cautionPage.cautionRadioButtons().should('exist')
      cautionPage.cautionRadioButtons().find('input[value="yes"]').should('not.be.checked')
      cautionPage.cautionRadioButtons().find('input[value="no"]').should('not.be.checked')
    })
    it('cancel link goes back to reviewer version of hearing details page', () => {
      cy.visit(adjudicationUrls.isThisACaution.urls.edit(100))
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })

  describe('saves', () => {
    it('should submit successfully, answer yes', () => {
      cy.visit(`${adjudicationUrls.isThisACaution.urls.edit(100)}`)
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.cautionRadioButtons().find('input[value="yes"]').check()

      cautionPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingsCheckAnswers.urls.edit(100))
        expect(loc.search).to.eq('?adjudicator=&amount=&plea=&damagesOwed=')
      })
    })
    it('should submit successfully, answer no', () => {
      cy.visit(`${adjudicationUrls.isThisACaution.urls.edit(100)}`)
      const cautionPage = Page.verifyOnPage(CautionPage)
      cautionPage.cautionRadioButtons().find('input[value="no"]').check()

      cautionPage.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.hearingDetails.urls.review(100))
      })
    })
  })
})
