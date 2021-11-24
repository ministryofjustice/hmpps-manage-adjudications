import CheckYourAnswers from '../pages/checkYourAnswers'
import Page from '../pages/page'

context('Check Your Answers', () => {
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
    cy.task('stubStartNewDraftAdjudication', {
      draftAdjudication: {
        id: 3456,
        incidentDetails: {
          dateTimeOfIncident: '2021-11-03T11:09:42',
          locationId: 234,
        },
        incidentStatement: {},
        prisonerNumber: 'G6415GD',
      },
    })
    cy.task('stubPostDraftIncidentStatement', {
      id: 3456,
      response: {
        draftAdjudication: {
          id: 3456,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 234,
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-11-09T13:51:37.241636',
          },
          incidentStatement: {
            id: 23,
            statement: 'This is my statement',
            completed: true,
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-11-09T13:55:00',
          },
          createdByUserId: 'TEST_GEN',
          createdDateTime: '2021-11-03T11:09:42',
        },
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      response: {
        draftAdjudication: {
          id: 3456,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 234,
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-11-09T13:51:37.241636',
          },
          incidentStatement: {
            id: 23,
            statement: 'This is my statement',
            completed: true,
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-11-09T13:55:00',
          },
          createdByUserId: 'TEST_GEN',
          createdDateTime: '2021-11-03T11:09:42',
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
    cy.task('stubSubmitCompleteDraftAdjudication', {
      id: 3456,
      response: {
        adjudicationNumber: 234,
        incidentDetails: {
          dateTimeOfIncident: '2021-11-03T11:09:42',
          locationId: 234,
          createdByUserId: 'TEST_GEN',
          createdDateTime: '2021-11-09T13:51:37.241636',
        },
        incidentStatement: {
          id: 23,
          statement: 'This is my statement',
          completed: true,
          createdByUserId: 'TEST_GEN',
          createdDateTime: '2021-11-09T13:55:00',
        },
        prisonerNumber: 'G6415GD',
      },
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

    CheckYourAnswersPage.incidentDetailsSummary().should('exist')
    CheckYourAnswersPage.incidentStatement().should('exist')
    CheckYourAnswersPage.submitButton().should('exist')
    CheckYourAnswersPage.exitButton().should('exist')
  })
  it('should contain the correct incident details', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

    CheckYourAnswersPage.incidentDetailsSummary()
      .find('dt')
      .then($summaryLabels => {
        expect($summaryLabels.get(0).innerText).to.contain('Reporting Officer')
        expect($summaryLabels.get(1).innerText).to.contain('Date')
        expect($summaryLabels.get(2).innerText).to.contain('Time')
        expect($summaryLabels.get(3).innerText).to.contain('Location')
      })

    CheckYourAnswersPage.incidentDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain('T. User')
        expect($summaryData.get(1).innerText).to.contain('3 November 2021')
        expect($summaryData.get(2).innerText).to.contain('11:09')
        expect($summaryData.get(3).innerText).to.contain('Workshop 19 - Braille')
      })
  })
  it('should contain the correct incident statement', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

    CheckYourAnswersPage.incidentStatement().should('contain.text', 'This is my statement')
  })
  it('should go to the completion page if the user submits', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
    CheckYourAnswersPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/prisoner-placed-on-report/234')
    })
  })
  it('should go to the task page if the user exits without submitting', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
    CheckYourAnswersPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/G6415GD/3456')
    })
  })
  it('should go to the incident details page if the incident details change link is clicked', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
    CheckYourAnswersPage.incidentDetailsChangeLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-details/G6415GD/3456/edit')
    })
  })
  it('should go to the incident statement page if the incident statement change link is clicked', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
    CheckYourAnswersPage.incidentStatementChangeLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-statement/G6415GD/3456')
    })
  })
})
