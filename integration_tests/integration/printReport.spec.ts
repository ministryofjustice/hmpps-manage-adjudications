import Page from '../pages/page'
import PrintReport from '../pages/printReport'

context('Print a copy of this report', () => {
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
      id: 1524242,
      response: {
        reportedAdjudication: {
          adjudicationNumber: 3,
          prisonerNumber: 'G6415GD',
          bookingId: 123,
          createdByUserId: 'AJONES',
          dateTimeReportExpires: '2020-12-08T10:00:00',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-06T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
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
    cy.task('stubGetNeurodiversities', {
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
    cy.task('stubGetAgency', { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' })
    cy.task('stubGetUser', { username: 'AJONES', response: { username: 'AJONES', name: 'Alex Jones' } })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(`/print-report/1524242`)
    Page.verifyOnPage(PrintReport)
    cy.contains('John Smith must be given a copy of this report by 10:00 on Tuesday 8 December')
    cy.contains('John Smith’s preferred language is:')
    cy.contains('French')
    cy.contains('They have other languages of:')
    cy.contains('Spanish')
    cy.contains('German')
  })

  it('should redirect the user to the referrer on finish', () => {
    cy.visit(`/print-report/1524242?referrer=/prisoner-report/G6415GD/1524242/report`)
    const printReportPage = Page.verifyOnPage(PrintReport)
    printReportPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/prisoner-report/G6415GD/1524242/report')
    })
  })
})
