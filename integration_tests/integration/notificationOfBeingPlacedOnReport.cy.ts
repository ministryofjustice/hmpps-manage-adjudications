import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'

const testData = new TestData()

context('Prisoner has been placed on report', () => {
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
      }),
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524242,
      response: {
        reportedAdjudication: {
          ...testData.reportedAdjudication({
            adjudicationNumber: 3,
            prisonerNumber: 'G6415GD',
            // dateTimeOfIncident: '2020-12-06T10:00:00',
            locationId: 25538,
            offenceDetails: { offenceCode: 1001 },
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
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetUser', { username: 'USER1', response: testData.userFromUsername() })

    cy.signIn()
  })

  it('The notification of being on report should present on the print report page', () => {
    cy.request(adjudicationUrls.printPdf.urls.start(1524242)).should(res => {
      expect(res.status).to.eq(200)
      expect(res.headers['content-disposition']).to.contain('adjudication-report-1524242')
      expect(res.headers['content-type']).to.eq('application/pdf')
    })
  })
})
