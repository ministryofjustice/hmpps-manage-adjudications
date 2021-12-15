import ConfirmedOnReport from '../pages/confirmedOnReport'
import Page from '../pages/page'
import PrintReport from '../pages/printReport'
import NotificationOfBeingPlacedOnReport from '../pages/notificationOfBeingPlacedOnReport'

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
          dateTimeReportExpires: '2020-12-08T10:00:00',
          createdByUserId: 'AJONES',
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
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetUser', { username: 'AJONES', response: { username: 'AJONES', name: 'Alex Jones' } })

    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(`/prisoner-placed-on-report/1524242`)
    Page.verifyOnPage(ConfirmedOnReport)
    cy.contains('Your report number is')
    cy.contains('1524242')
    cy.contains('John Smith must be given a copy of this report by 10:00 on 8 December 2020')
    cy.contains('John Smith’s preferred language is:')
    cy.contains('French')
    cy.contains('They have other languages of:')
    cy.contains('Spanish')
    cy.contains('German')
  })

  it('should redirect the user to /place-a-prisoner-on-report on finish', () => {
    cy.visit(`/prisoner-placed-on-report/1524242`)
    const confirmedOnReportPage = Page.verifyOnPage(ConfirmedOnReport)
    confirmedOnReportPage.finishButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-a-prisoner-on-report')
    })
  })

  it('The notification of being on report should present but hidden', () => {
    cy.visit(`/print-report/1524242`)
    const printReportPage = Page.verifyOnPage(PrintReport)
    printReportPage.printButton().should('exist')
    const notificationOfBeingPlacedOnReportPage = new NotificationOfBeingPlacedOnReport('Print a copy of this report')
    notificationOfBeingPlacedOnReportPage.checkOnPage()
    notificationOfBeingPlacedOnReportPage.section().should('exist').should('not.be.visible')
    notificationOfBeingPlacedOnReportPage.adjudicationNumber().should('contain', '1524242')
    notificationOfBeingPlacedOnReportPage.prisonerDisplayName().should('contain', 'John, Smith')
    notificationOfBeingPlacedOnReportPage.prisonerNumber().should('contain', 'G6415GD')
    notificationOfBeingPlacedOnReportPage
      .prisonerLocationDescription()
      .should('contain', 'Moorland (HMP & YOI) - 1-2-015')
    notificationOfBeingPlacedOnReportPage.incidentDate().should('contain', '6 December 2020')
    notificationOfBeingPlacedOnReportPage.incidentTime().should('contain', '10:00')
    notificationOfBeingPlacedOnReportPage.incidentLocationDescription().should('contain', 'Moorland (HMP & YOI) - Adj')
    notificationOfBeingPlacedOnReportPage.statement().should('contain', 'test')
  })
})
