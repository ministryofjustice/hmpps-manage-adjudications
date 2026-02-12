import AdjudicationHistoryPage from '../pages/adjudicationHistory'
import Page from '../pages/page'
import { formatDateForDatePicker, generateRange } from '../../server/utils/utils'
import { ReportedAdjudication, ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'
import { PunishmentType } from '../../server/data/PunishmentResult'

const testData = new TestData()

context('Adjudication history', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', ['NOT_REVIEWER'])
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
    adjudicationHistoryPage.paginationResults().should('not.exist')
  })

  it('should display the results correctly - no punishments present', () => {
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
        punishments: [],
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
    adjudicationHistoryPage.card().first().should('contain.text', 'Happened at: Moorland (HMP & YOI)')
    adjudicationHistoryPage.card().first().should('contain.text', 'Awaiting review')
    adjudicationHistoryPage
      .card()
      .first()
      .should(
        'contain.text',
        'Destroys or damages any part of a young offender institution or any other property other than his own',
      )
  })
  it('should display the results correctly - punishments present', () => {
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
        punishments: [
          testData.punishmentWithSchedule({}),
          testData.punishmentWithSchedule({ type: PunishmentType.ADDITIONAL_DAYS, schedule: { duration: 1 } }),
        ],
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
    adjudicationHistoryPage.card().first().should('contain.text', 'Happened at: Moorland (HMP & YOI)')
    adjudicationHistoryPage.card().first().should('contain.text', 'Awaiting review')
    adjudicationHistoryPage
      .card()
      .first()
      .should('contain.text', 'Loss of canteen: 10 days - suspended until 03/04/2023')
    adjudicationHistoryPage.card().first().should('contain.text', 'Additional days: 1 day')
    adjudicationHistoryPage
      .card()
      .first()
      .should(
        'contain.text',
        'Destroys or damages any part of a young offender institution or any other property other than his own',
      )
  })
  it('should contain the link to the report', () => {
    cy.task('stubGetPrisonerAdjudicationHistory', {
      bookingId: '123',
      number: 0,
      allContent: [
        testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2023-11-15T11:30:00',
          dateTimeOfDiscovery: '2323-11-15T11:30:00',
          originatingAgencyId: 'LEI',
          otherData: {
            overrideAgencyId: 'SKI',
          },
          offenceDetails: {
            offenceCode: 17002,
            offenceRule: {
              paragraphNumber: '18',
              paragraphDescription:
                'Destroys or damages any part of a young offender institution or any other property other than his own',
            },
          },
        }),
        testData.reportedAdjudication({
          chargeNumber: '2',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2023-11-15T11:30:00',
          dateTimeOfDiscovery: '2323-11-15T11:30:00',
          originatingAgencyId: 'LEI',
          otherData: {
            overrideAgencyId: 'MDI',
          },
          offenceDetails: {
            offenceCode: 17002,
            offenceRule: {
              paragraphNumber: '18',
              paragraphDescription:
                'Destroys or damages any part of a young offender institution or any other property other than his own',
            },
          },
        }),
        testData.reportedAdjudication({
          chargeNumber: '3',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2023-11-15T11:30:00',
          dateTimeOfDiscovery: '2323-11-15T11:30:00',
          originatingAgencyId: 'MDI',
          otherData: {
            overrideAgencyId: 'SKI',
          },
          offenceDetails: {
            offenceCode: 17002,
            offenceRule: {
              paragraphNumber: '18',
              paragraphDescription:
                'Destroys or damages any part of a young offender institution or any other property other than his own',
            },
          },
        }),
      ],
    })

    cy.visit(adjudicationUrls.adjudicationHistory.urls.start('G6415GD'))
    const adjudicationHistoryPage: AdjudicationHistoryPage = Page.verifyOnPage(AdjudicationHistoryPage)
    adjudicationHistoryPage.card().should('have.length', 3)
    adjudicationHistoryPage.cardLinks().eq(1).find('a').should('exist')
    adjudicationHistoryPage.cardLinks().last().find('a').should('exist')
    adjudicationHistoryPage.cardLinks().eq(0).find('a').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReportConsolidated.urls.view('G6415GD', 1))
    })
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
    adjudicationHistoryPage.paginationResults().first().should('have.text', 'Showing 1 to 20 of 40 total results')
    adjudicationHistoryPage.paginationLink(1).should('have.attr', 'aria-current', 'page')
    adjudicationHistoryPage.paginationLink(2).should('exist')
    adjudicationHistoryPage.paginationLink(2).click()
    adjudicationHistoryPage.paginationResults().first().should('have.text', 'Showing 21 to 40 of 40 total results')
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
          punishments: [testData.punishmentWithSchedule({ type: PunishmentType.ADDITIONAL_DAYS })],
        }),
      ],
      filter: {
        fromDate: '2022-11-01',
        toDate: '2022-11-20',
        status: ReportedAdjudicationStatus.CHARGE_PROVED,
        agency: 'MDI',
        ada: true,
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
    cy.get('#punishment').check()
    cy.get('#status-13').check()
    adjudicationHistoryPage.applyFilters().click()
    adjudicationHistoryPage.card().should('have.length', 1)
    adjudicationHistoryPage.card().first().should('contain.text', '1')
    adjudicationHistoryPage.card().first().should('contain.text', 'Date of discovery: 15/11/2022 - 11:30')
    adjudicationHistoryPage.card().first().should('contain.text', 'Moorland (HMP & YOI)')
    adjudicationHistoryPage.card().first().should('contain.text', 'Charge proved')
  })
})

context('Adjudication history - as ALO', () => {
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

  it('should contain the link to the report and go the reviewer page', () => {
    cy.task('stubGetPrisonerAdjudicationHistory', {
      bookingId: '123',
      number: 0,
      allContent: [
        testData.reportedAdjudication({
          canActionFromHistory: true,
          chargeNumber: '1',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2023-11-15T11:30:00',
          dateTimeOfDiscovery: '2323-11-15T11:30:00',
          originatingAgencyId: 'LEI',
          otherData: {
            overrideAgencyId: 'SKI',
          },
          offenceDetails: {
            offenceCode: 17002,
            offenceRule: {
              paragraphNumber: '18',
              paragraphDescription:
                'Destroys or damages any part of a young offender institution or any other property other than his own',
            },
          },
        }),
      ],
    })
    cy.visit(adjudicationUrls.adjudicationHistory.urls.start('G6415GD'))
    const adjudicationHistoryPage: AdjudicationHistoryPage = Page.verifyOnPage(AdjudicationHistoryPage)
    adjudicationHistoryPage.cardLinks().eq(0).find('a').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.prisonerReport.urls.review(1))
    })
  })
})
