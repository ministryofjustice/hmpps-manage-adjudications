import { printPdf } from '../../server/utils/urlGenerator'

context('Prisoner has been placed on report', () => {
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
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMP & YOI)' },
        categoryCode: 'C',
        language: 'French',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
      },
    })
    cy.task('stubGetReportedAdjudication', {
      id: 1524242,
      response: {
        reportedAdjudication: {
          adjudicationNumber: 3,
          prisonerNumber: 'G6415GD',
          bookingId: 123,
          createdByUserId: 'AJONES',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-06T10:00:00',
            handoverDeadline: '2020-12-08T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
          offenceDetails: [],
          incidentRole: {},
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
      locationId: 2,
      response: { locationId: 2, agencyId: 'MDI', userDescription: 'Adj', locationPrefix: 'MDI-RES-MCASU-MCASU' },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetUser', { username: 'AJONES', response: { username: 'AJONES', name: 'Alex Jones' } })

    cy.signIn()
  })

  it('The notification of being on report should present on the print report page', () => {
    cy.visit(`/prisoner-placed-on-report/1524242`)
    cy.get('[data-qa=printLink]').click()
    cy.request(printPdf.urls.start(1524242)).should(res => {
      expect(res.status).to.eq(200)
      expect(res.headers['content-disposition']).to.contain('adjudication-report-1524242')
      expect(res.headers['content-type']).to.eq('application/pdf')
    })
  })
})
