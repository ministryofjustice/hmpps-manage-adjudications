import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import ConfirmedOnReport from '../pages/confirmedOnReport'
import Page from '../pages/page'

const testData = new TestData()

context('Report has been submitted for review', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'John',
        lastName: 'Smith',
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524242,
      response: {
        reportedAdjudication: testData.reportedAdjudication({
          adjudicationNumber: 3,
          prisonerNumber: 'G6415GD',
          createdByUserId: 'AJONES',
        }),
      },
    })
    cy.task('stubGetSecondaryLanguages', {
      bookingId: 123,
      response: [
        {
          code: 'SPA',
          description: 'Spanish',
          canRead: true,
          canWrite: false,
          canSpeak: true,
        },
        {
          code: 'GER',
          description: 'German',
          canRead: true,
          canWrite: false,
          canSpeak: false,
        },
      ],
    })
    cy.task('stubGetLearnerProfile', {
      prisonerNumber: 'G6415GD',
      response: [
        {
          prn: 'G6415GD',
          establishmentId: 'MDI',
          uln: '1234123412',
          primaryLDDAndHealthProblem: 'Speech, language and communication needs',
          additionalLDDAndHealthProblems: ['Hearing impairment', 'Other difficulty'],
        },
      ],
    })
    cy.task('stubGetLocation', {
      locationId: 2,
      response: { locationId: 2, agencyId: 'MDI', userDescription: 'Adj', locationPrefix: 'MDI-RES-MCASU-MCASU' },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetUser', { username: 'AJONES', response: { username: 'AJONES', name: 'Alex Jones' } })

    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.confirmedOnReport.urls.start(1524242))
    Page.verifyOnPage(ConfirmedOnReport)
    cy.contains('This report will be reviewed. The reviewer can do one of 3 things')
    cy.contains('Check your prison’s processes.')
  })

  it('should redirect the user to your completed reports on finish', () => {
    cy.visit(adjudicationUrls.confirmedOnReport.urls.start(1524242))
    const confirmedOnReportPage = Page.verifyOnPage(ConfirmedOnReport)
    confirmedOnReportPage.finishLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.yourCompletedReports.root)
    })
  })
})
