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
            chargeNumber: '1524242',
            prisonerNumber: 'G6415GD',
            locationId: 25538,
            offenceDetails: { offenceCode: 1001 },
            hearings: [testData.singleHearing({ dateTimeOfHearing: '2025-11-15T09:00:00' })],
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
    cy.task('stubGetLocation', {})
    cy.task('stubGetDpsLocationId', {})
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetUser', { username: 'USER1', response: testData.userFromUsername() })

    cy.signIn()
  })

  it('The notification of being on report should present on the print report page', () => {
    cy.request(`${adjudicationUrls.printPdf.urls.dis12('1524242')}?copy=staff`).should(res => {
      expect(res.status).to.eq(200)
      expect(res.headers['content-disposition']).to.contain('notice-of-being-placed-on-report-1524242.pdf')
      expect(res.headers['content-type']).to.eq('application/pdf')
    })
  })
})
