import adjudicationUrls from '../../server/utils/urlGenerator'
import ConfirmedOnReport from '../pages/confirmedOnReportChangeAfterReview'
import Page from '../pages/page'

context('Report has been changed', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: {
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)' },
        categoryCode: 'C',
        language: 'French',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524493,
      response: {
        reportedAdjudication: {
          adjudicationNumber: 1524493,
          prisonerNumber: 'G6415GD',
          bookingId: 1201395,
          createdDateTime: '2021-12-09T09:40:00',
          incidentDetails: {
            locationId: 197682,
            dateTimeOfIncident: '2021-12-09T09:40:00',
            handoverDeadline: '2021-12-11T09:40:00',
          },
          incidentStatement: {
            statement: 'Statement here.',
          },
          createdByUserId: 'TEST_GEN',
        },
      },
    })
    cy.task('stubGetUserFromUsername', {
      username: 'TEST_GEN',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'TEST_GEN',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(
      `${adjudicationUrls.confirmedOnReport.urls.confirmationOfChangePostReview(
        1524493
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(1524493)}`
    )
    Page.verifyOnPage(ConfirmedOnReport)
    cy.contains('John Smith’s report has been changed')
    cy.contains('What happens next').should('not.exist')
    cy.contains('You will not get an email notification about this report.').should('not.exist')
    cy.contains('Check your prison’s processes').should('not.exist')
  })

  it('should redirect the user to prisoner report on finish - reviewer', () => {
    cy.visit(
      `${adjudicationUrls.confirmedOnReport.urls.confirmationOfChangePostReview(
        1524493
      )}?referrer=${adjudicationUrls.prisonerReport.urls.review(1524493)}`
    )
    const confirmedOnReportPage = Page.verifyOnPage(ConfirmedOnReport)
    confirmedOnReportPage.finishLink().should('contain.text', 'Back to report')
    confirmedOnReportPage.finishLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(1524493))
    })
  })

  it('should redirect the user to prisoner report on finish - reporter', () => {
    cy.visit(
      `${adjudicationUrls.confirmedOnReport.urls.confirmationOfChangePostReview(
        1524493
      )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524493)}`
    )
    const confirmedOnReportPage = Page.verifyOnPage(ConfirmedOnReport)
    confirmedOnReportPage.finishLink().should('contain.text', 'Back to report')
    confirmedOnReportPage.finishLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(1524493))
    })
  })

  it('should redirect to the homepage if there is no referrer present', () => {
    cy.visit(adjudicationUrls.confirmedOnReport.urls.confirmationOfChangePostReview(1524493))
    const confirmedOnReportPage = Page.verifyOnPage(ConfirmedOnReport)
    confirmedOnReportPage.finishLink().should('contain.text', 'Back to homepage')
    confirmedOnReportPage.finishLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.homepage.root)
    })
  })
})
