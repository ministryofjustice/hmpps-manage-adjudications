import AdjudicationHistoryPage from '../pages/adjudicationHistory'
import Page from '../pages/page'
import { formatDateForDatePicker, generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

context('Adjudication history', () => {
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
    cy.task('stubGetMovementByOffender', {
      response: testData.prisonerMovement({
        offenderNo: 'G6415GD',
      }),
    })
    cy.signIn()
  })

  it('should say when there are no results', () => {
    cy.task('stubGetPrisonerAdjudicationHistory', { bookingId: '123', number: 0, allContent: [] })

    cy.visit(adjudicationUrls.adjudicationHistory.urls.start('G6415GD'))
    const adjudicationHistoryPage: AdjudicationHistoryPage = Page.verifyOnPage(AdjudicationHistoryPage)

    adjudicationHistoryPage.noResultsMessage().should('exist')
    adjudicationHistoryPage.paginationResults().should('exist')
  })

  it('should display the results correctly', () => {
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 5, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2023-11-15T11:30:00',
        dateTimeOfDiscovery: '2323-11-15T11:30:00',
        offenceDetails: {
          offenceCode: 17002,
          offenceRule: {
            paragraphNumber: '18',
            paragraphDescription:
              'Destroys or damages any part of a young offender institution or any other property other than his own',
          },
        },
      })
    })
    cy.task('stubGetPrisonerAdjudicationHistory', {
      bookingId: '123',
      number: 0,
      allContent: manyReportedAdjudications,
    })

    cy.visit(adjudicationUrls.adjudicationHistory.urls.start('G6415GD'))
    const adjudicationHistoryPage: AdjudicationHistoryPage = Page.verifyOnPage(AdjudicationHistoryPage)
    adjudicationHistoryPage.card().should('have.length', 5)
    adjudicationHistoryPage.card().first().should('contain.text', '1')
    adjudicationHistoryPage.card().first().should('contain.text', 'Date of discovery: 15/11/2323 - 11:30')
    adjudicationHistoryPage.card().first().should('contain.text', 'Moorland (HMP & YOI)')
    adjudicationHistoryPage.card().first().should('contain.text', 'Awaiting review')
    adjudicationHistoryPage
      .card()
      .first()
      .should(
        'contain.text',
        'Destroys or damages any part of a young offender institution or any other property other than his own'
      )
  })
  it('pagination should work', () => {
    const manyReportedAdjudications: ReportedAdjudication[] = generateRange(1, 40, _ => {
      return testData.reportedAdjudication({
        chargeNumber: _ as unknown as string,
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2023-11-15T11:30:00',
        dateTimeOfDiscovery: '2323-11-15T11:30:00',
        offenceDetails: {
          offenceCode: 17002,
          offenceRule: {
            paragraphNumber: '18',
            paragraphDescription:
              'Destroys or damages any part of a young offender institution or any other property other than his own',
          },
        },
      })
    })
    cy.task('stubGetPrisonerAdjudicationHistory', {
      bookingId: '123',
      number: 0,
      allContent: manyReportedAdjudications,
    })
    cy.task('stubGetPrisonerAdjudicationHistory', {
      bookingId: '123',
      number: 1,
      allContent: manyReportedAdjudications,
    })

    cy.visit(adjudicationUrls.adjudicationHistory.urls.start('G6415GD'))
    const adjudicationHistoryPage: AdjudicationHistoryPage = Page.verifyOnPage(AdjudicationHistoryPage)
    adjudicationHistoryPage.card().should('have.length', 20)
    adjudicationHistoryPage.paginationResults().should('have.text', 'Showing 1 to 20 of 40 results')
    adjudicationHistoryPage.paginationLink(1).should('not.exist')
    adjudicationHistoryPage.paginationLink(2).should('exist')
    adjudicationHistoryPage.paginationLink(2).click()
    adjudicationHistoryPage.paginationResults().should('have.text', 'Showing 21 to 40 of 40 results')
  })

  it('filtering should work', () => {
    cy.task('stubGetPrisonerAdjudicationHistory', { bookingId: '123', number: 0, allContent: [] })
    cy.task('stubGetPrisonerAdjudicationHistory', {
      bookingId: '123',
      number: 0,
      allContent: [
        testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2022-11-15T11:30:00',
          dateTimeOfDiscovery: '2022-11-15T11:30:00',
          offenceDetails: {
            offenceCode: 17002,
            offenceRule: {
              paragraphNumber: '18',
              paragraphDescription:
                'Destroys or damages any part of a young offender institution or any other property other than his own',
            },
          },
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
        }),
      ],
      filter: {
        fromDate: '2022-11-01',
        toDate: '2022-11-20',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        agency: 'MDI',
      },
    })
    cy.visit(adjudicationUrls.adjudicationHistory.urls.start('G6415GD'))
    const adjudicationHistoryPage: AdjudicationHistoryPage = Page.verifyOnPage(AdjudicationHistoryPage)
    adjudicationHistoryPage.noResultsMessage().should('exist')
    const fromDate = formatDateForDatePicker(new Date('11/1/2022').toISOString(), 'short')
    const toDate = formatDateForDatePicker(new Date('11/20/2022').toISOString(), 'short')
    cy.get('#fromDate').type(fromDate)
    cy.get('#toDate').type(toDate)
    cy.get('#agency').check()
    cy.get('#status-13').check()
    adjudicationHistoryPage.applyFilters().click()
    adjudicationHistoryPage.card().should('have.length', 1)
    adjudicationHistoryPage.card().first().should('contain.text', '1')
    adjudicationHistoryPage.card().first().should('contain.text', 'Date of discovery: 15/11/2022 - 11:30')
    adjudicationHistoryPage.card().first().should('contain.text', 'Moorland (HMP & YOI)')
    adjudicationHistoryPage.card().first().should('contain.text', 'Charge proved')
  })
})