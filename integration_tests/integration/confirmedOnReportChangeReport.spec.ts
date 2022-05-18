import adjudicationUrls from '../../server/utils/urlGenerator'
import ConfirmedOnReport from '../pages/confirmedOnReportChangeReport'
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
    cy.visit(adjudicationUrls.confirmedOnReport.urls.reporterView(1524493))
    Page.verifyOnPage(ConfirmedOnReport)
    cy.contains('John Smith’s report has been changed')
    cy.contains('What you must do next')
    cy.contains(
      'You must follow local processes. You might need to give a copy of the printed report to another member of staff to review before it is given to John Smith.'
    )
    cy.contains(
      'John Smith needs an updated copy of their report. They need to receive this by 09:40 on 11 December 2021.'
    )
  })

  it('should redirect the user to prisoner report on finish', () => {
    cy.visit(adjudicationUrls.confirmedOnReport.urls.reporterView(1524493))
    const confirmedOnReportPage = Page.verifyOnPage(ConfirmedOnReport)
    confirmedOnReportPage.finishButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(1524493))
    })
  })
})
