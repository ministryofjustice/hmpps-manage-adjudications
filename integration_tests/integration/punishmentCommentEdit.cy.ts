import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import PunishmentCommentPage from '../pages/punishmentComment'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import { HearingOutcomeCode, OutcomeCode } from '../../server/data/HearingAndOutcomeResult'

const testData = new TestData()
context('Edit punishment comment', () => {
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
          adjudicationNumber: 99,
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
    cy.task('stubEditPunishmentComment', {
      adjudicationNumber: 99,
      id: 1,
    })
  })
  describe('Load punishment comment edit page', () => {
    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.edit(99, 1))
      const page = Page.verifyOnPage(PunishmentCommentPage)
      page.punishmentComment().should('exist')
      page.submitButton().should('exist')
      page.cancelButton().should('exist')
      page.submitButton().should('exist')
    })
    it('cancel link goes back to punishments page', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.edit(99, 1))
      const page = Page.verifyOnPage(PunishmentCommentPage)
      page.cancelButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review(99))
      })
    })
  })

  describe('Submit', () => {
    it('should error when punishment comment blank', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.edit(99, 1))
      const page = Page.verifyOnPage(PunishmentCommentPage)
      page.punishmentComment().clear()
      page.submitButton().click()

      page
        .errorSummary()
        .find('li')
        .then($error => {
          expect($error.get(0).innerText).to.contain('Enter a comment')
        })
    })
    it('should submit successfully and redirect', () => {
      cy.visit(adjudicationUrls.punishmentComment.urls.edit(99, 1))
      const page = Page.verifyOnPage(PunishmentCommentPage)
      page.punishmentComment().type('some text')
      page.submitButton().click()

      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.punishmentsAndDamages.urls.review(99))
      })
    })
  })
})
