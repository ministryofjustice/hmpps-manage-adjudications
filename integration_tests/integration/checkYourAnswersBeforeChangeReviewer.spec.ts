import CheckYourAnswers from '../pages/checkYourAnswersBeforeChangeReviewer'
import Page from '../pages/page'

context('Check Your Answers', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: {
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: {
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: {
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
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
          },
          incidentStatement: {
            id: 23,
            statement: 'This is my statement',
            completed: true,
          },
          startedByUserId: 'TEST_GEN',
        },
      },
    })

    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      response: {
        draftAdjudication: {
          id: 3456,
          adjudicationNumber: 234,
          prisonerNumber: 'G6415GD',
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            handoverDeadline: '2021-11-05T11:09:42',
            locationId: 234,
          },
          incidentStatement: {
            id: 23,
            statement: 'This is my statement',
            completed: true,
          },
          startedByUserId: 'USER1',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25c',
            offenceRule: {
              paragraphNumber: '25(c)',
              paragraphDescription:
                'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:',
            },
          },
          offenceDetails: [
            {
              offenceCode: 1001,
              offenceRule: {
                paragraphNumber: '1',
                paragraphDescription: 'Commits any assault',
              },
              victimPrisonersNumber: 'G5512G',
            },
          ],
        },
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
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
      username: 'USER1',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Test User',
        username: 'USER1',
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
        },
        incidentStatement: {
          id: 23,
          statement: 'This is my statement',
          completed: true,
        },
        prisonerNumber: 'G6415GD',
      },
    })
    cy.signIn()
  })
  it('should contain the required page elements', () => {
    cy.visit(`/check-your-answers/G6415GD/3456/review`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

    CheckYourAnswersPage.incidentDetailsSummary().should('exist')
    CheckYourAnswersPage.incidentDetailsChangeLink().should('exist')
    CheckYourAnswersPage.incidentStatement().should('exist')
    CheckYourAnswersPage.submitButton().should('exist')
    CheckYourAnswersPage.submitButton().contains('Confirm changes')
    CheckYourAnswersPage.exitButton().should('exist')
    CheckYourAnswersPage.exitButton().contains('Cancel')
  })
  it('should contain the correct incident details', () => {
    cy.visit(`/check-your-answers/G6415GD/3456/review`)
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
    cy.visit(`/check-your-answers/G6415GD/3456/review`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

    CheckYourAnswersPage.incidentStatement().should('contain.text', 'This is my statement')
  })
  it('should contain the correct offence details', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)

    CheckYourAnswersPage.offenceDetailsSummary()
      .find('dt')
      .then($summaryLabels => {
        expect($summaryLabels.get(0).innerText).to.contain(
          'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
        )
        expect($summaryLabels.get(1).innerText).to.contain('What did the incident involve?')
        expect($summaryLabels.get(2).innerText).to.contain('Who did John Smith assist James Jones to assault?')
        expect($summaryLabels.get(3).innerText).to.contain('Was the incident a racially aggravated assault?')
        expect($summaryLabels.get(4).innerText).to.contain('This offence broke')
      })

    CheckYourAnswersPage.offenceDetailsSummary()
      .find('dd')
      .then($summaryData => {
        expect($summaryData.get(0).innerText).to.contain(
          'Assault, fighting, or endangering the health or personal safety of others'
        )
        expect($summaryData.get(1).innerText).to.contain('Assaulting someone')
        expect($summaryData.get(2).innerText).to.contain('Another prisoner - Paul Wright')
        expect($summaryData.get(3).innerText).to.contain('Yes')
        expect($summaryData.get(4).innerText).to.contain(
          'Prison rule 51, paragraph 25(c)\n\nAssists another prisoner to commit, or to attempt to commit, any of the foregoing offences:\n\nPrison rule 51, paragraph 1\n\nCommits any assault'
        )
      })
  })
  it('should go to the completion page (changed - reviewer) if the user submits changes to the report', () => {
    cy.visit(`/check-your-answers/G6415GD/3456/review`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
    CheckYourAnswersPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/prisoner-placed-on-report/234/changes-confirmed/review')
    })
  })
  it('should go to the prisoner report page if the user cancels', () => {
    cy.visit(`/check-your-answers/G6415GD/3456/review`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
    CheckYourAnswersPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/prisoner-report/G6415GD/234/review')
    })
  })
  it('should go to the incident details page if the incident details change link is clicked', () => {
    cy.visit(`/check-your-answers/G6415GD/3456/review`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
    CheckYourAnswersPage.incidentDetailsChangeLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-details/G6415GD/3456/submitted/edit')
      expect(loc.href).to.include('?referrer=/check-your-answers/G6415GD/3456/review')
    })
  })
  it('should go to the incident details page if the offence details change link is clicked - to enter new offences', () => {
    cy.visit(`/check-your-answers/G6415GD/3456`)
    const CheckYourAnswersPage: CheckYourAnswers = Page.verifyOnPage(CheckYourAnswers)
    CheckYourAnswersPage.offenceDetailsChangeLink().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/incident-details/G6415GD/3456/edit')
    })
  })
})
