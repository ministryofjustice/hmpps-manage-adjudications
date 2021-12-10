import PrisonerReport from '../pages/prisonerReport'
import Page from '../pages/page'

context('Prisoner report', () => {
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
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
        categoryCode: 'C',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
      },
    })
    cy.task('stubCreateDraftFromCompleteAdjudication', {
      adjudicationNumber: 12345,
      response: {
        draftAdjudication: {
          id: 177,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            locationId: 234,
            dateTimeOfIncident: '2021-12-01T09:40:00',
            handoverDeadline: '2021-12-03T09:40:00',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
          startedByUserId: 'TEST_GEN',
        },
      },
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: [
        {
          locationId: 234,
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
    cy.task('stubGetUserFromUsername', {
      username: 'TEST_GEN',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'TEST_GEN',
        token: 'token-1',
        authSource: 'auth',
      },
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(`/prisoner-report/G6415GD/12345/report`)
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    PrisonerReportPage.incidentDetailsSummary().should('exist')
    PrisonerReportPage.incidentStatement().should('exist')
    PrisonerReportPage.returnLink().should('exist')
  })
  it('should contain the correct incident details', () => {
    cy.visit(`/prisoner-report/G6415GD/12345/report`)
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    PrisonerReportPage.incidentDetailsSummary()
      .find('dt')
      .then($summaryLabels => {
        expect($summaryLabels.get(0).innerText).to.contain('Reporting Officer')
        expect($summaryLabels.get(1).innerText).to.contain('Date')
        expect($summaryLabels.get(2).innerText).to.contain('Time')
        expect($summaryLabels.get(3).innerText).to.contain('Location')
      })

    PrisonerReportPage.incidentDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('T. User')
        expect($summaryData.get(1).innerText).to.contain('1 December 2021')
        expect($summaryData.get(2).innerText).to.contain('09:40')
        expect($summaryData.get(3).innerText).to.contain('Workshop 19 - Braille')
      })
  })
  it('should contain the correct incident statement', () => {
    cy.visit(`/prisoner-report/G6415GD/12345/report`)
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)

    PrisonerReportPage.incidentStatement().should('contain.text', 'TESTING')
  })
  it('should go to the incident details page if the incident details change link is clicked', () => {
    cy.visit(`/prisoner-report/G6415GD/12345/report`)
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.incidentDetailsChangeLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-details/G6415GD/177/edit')
    })
  })
  it('should go to the incident statement page if the incident statement change link is clicked', () => {
    cy.visit(`/prisoner-report/G6415GD/12345/report`)
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.incidentStatementChangeLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-statement/G6415GD/177')
    })
  })
  it('should go to /your-completed-reports if the return link is clicked', () => {
    cy.visit(`/prisoner-report/G6415GD/12345/report`)
    const PrisonerReportPage: PrisonerReport = Page.verifyOnPage(PrisonerReport)
    PrisonerReportPage.returnLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/your-completed-reports')
    })
  })
})
