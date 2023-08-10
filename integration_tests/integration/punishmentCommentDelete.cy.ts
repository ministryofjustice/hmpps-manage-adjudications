import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentCommentDeletePage from '../pages/punishmentCommentDelete'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { HearingOutcomeCode, OutcomeCode } from '../../server/data/HearingAndOutcomeResult'

const testData = new TestData()
context('Delete punishment comment', () => {
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
    cy.task('stubGetReportedAdjudication', {
      id: 99,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '99',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          prisonerNumber: 'G6415GD',
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
                  caution: false,
                }),
              },
            },
          ],
          punishmentComments: [testData.singlePunishmentComment({})],
        }),
      },
    })
    cy.task('stubDeletePunishmentComment', {
      chargeNumber: 99,
      id: 1,
    })
  })
  describe('Load confirm deletion page', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.delete('99', 1))
      const page = Page.verifyOnPage(PunishmentCommentDeletePage)
      page.subtitleCommentText().should('exist')
      page.comment().should('exist')
      page.radioButtons().should('exist')
      page.submitButton().should('exist')
    })
  })

  describe('Submit', () => {
    it('should error when option not selected', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.delete('99', 1))
      const page = Page.verifyOnPage(PunishmentCommentDeletePage)
      page.submitButton().click()

      page
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Select yes if you want to remove this comment')
        })
    })
    it('should submit successfully and redirect - option "Yes"', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.delete('99', 1))
      const page = Page.verifyOnPage(PunishmentCommentDeletePage)
      page.radioButtons().find('input[value="yes"]').click()
      page.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('99'))
      })
    })
    it('should submit successfully and redirect - option "No"', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.delete('99', 1))
      const page = Page.verifyOnPage(PunishmentCommentDeletePage)
      page.radioButtons().find('input[value="no"]').click()
      page.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review('99'))
      })
    })
  })
})
