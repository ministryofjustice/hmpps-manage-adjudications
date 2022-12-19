import { PrisonerGender } from '../../server/data/DraftAdjudicationResult'
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
          adjudicationNumber: 3,
          prisonerNumber: 'G6415GD',
          gender: PrisonerGender.MALE,
          bookingId: 123,
          createdByUserId: 'AJONES',
          createdDateTime: '2020-12-06T10:00:00',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-06T10:00:00',
            handoverDeadline: '2020-12-08T10:00:00',
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
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: [
        {
          locationId: 27029,
          agencyId: 'MDI',
          userDescription: 'Workshop 19 - Braille',
        },
        {
          locationId: 27008,
          agencyId: 'MDI',
          userDescription: 'Workshop 2',
        },
        {
          locationId: 27009,
          agencyId: 'MDI',
          userDescription: 'Workshop 3 - Plastics',
        },
        {
          locationId: 27010,
          agencyId: 'MDI',
          userDescription: 'Workshop 4 - PICTA',
        },
      ],
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 1524242,
      response: {
        draftAdjudication: {
          id: 177,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 234,
            dateTimeOfIncident: '2020-12-06T10:00:00',
            handoverDeadline: '2020-12-08T10:00:00',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
          startedByUserId: 'AJONES',
        },
      },
    })
    cy.task('stubGetAgency', { agencyId: 'MDI', response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' } })
    cy.task('stubGetUser', { username: 'AJONES', response: { username: 'AJONES', name: 'Alex Jones' } })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.printReport.urls.start(1524242))
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
      `${adjudicationUrls.printReport.urls.start(1524242)}?referrer=${adjudicationUrls.prisonerReport.urls.report(
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
