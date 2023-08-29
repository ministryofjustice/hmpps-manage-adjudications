import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import Page from '../pages/page'
import PrintReport from '../pages/printReport'

const testData = new TestData()

context('Print a copy of this report', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        language: 'French',
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524242,
      response: {
        reportedAdjudication: {
          ...testData.reportedAdjudication({
            chargeNumber: '1524242',
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2020-12-06T10:00:00',
            handoverDeadline: '2020-12-08T10:00:00',
            locationId: 25538,
          }),
        },
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
      locationId: 25538,
      response: testData.residentialLocations()[0],
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: testData.residentialLocations(),
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      chargeNumber: '1524242',
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 177,
          prisonerNumber: 'G6415GD',
          locationId: 25538,
          dateTimeOfIncident: '2020-12-06T10:00:00',
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
        }),
      },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetUser', { username: 'USER1', response: testData.userFromUsername() })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.printReport.urls.dis12('1524242'))
    Page.verifyOnPage(PrintReport)
    cy.contains('John Smith must be given a copy of this report by 10:00 on Tuesday, 8 December 2020.')
    cy.contains('John Smith’s preferred language is:')
    cy.contains('French')
    cy.contains('They have other languages of:')
    cy.contains('Spanish')
    cy.contains('German')
  })

  it('should redirect the user to the referrer on finish', () => {
    cy.visit(
      `${adjudicationUrls.printReport.urls.dis12('1524242')}?referrer=${adjudicationUrls.prisonerReport.urls.report(
        1524242
      )}`
    )
    const printReportPage = Page.verifyOnPage(PrintReport)
    printReportPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.report(1524242))
    })
  })
})
