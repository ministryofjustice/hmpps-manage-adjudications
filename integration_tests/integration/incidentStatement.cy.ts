import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import IncidentStatement from '../pages/incidentStatement'
import Page from '../pages/page'

const testData = new TestData()

context('Incident Statement', () => {
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
  })
  context('Incident details and offence details present and correct', () => {
    beforeEach(() => {
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:42',
              handoverDeadline: '2021-11-05T11:09:42',
              locationId: 234,
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
            offenceDetails: {
              offenceCode: 1001,
              offenceRule: {
                paragraphNumber: '1',
                paragraphDescription: 'Commits any assault',
              },
              victimPrisonersNumber: 'G5512G',
            },
          },
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
              handoverDeadline: '2021-11-05T11:09:42',
              locationId: 234,
            },
            startedByUserId: 'USER1',
            incidentStatement: {
              statement: 'This is my statement',
            },
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

      cy.signIn()
    })

    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.statementTextArea().should('exist')
      incidentStatementPage.statementRadios().should('exist')
      incidentStatementPage.submitButton().should('exist')
    })

    it('should show validation message if there is no statement given', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.radioYes().check()
      incidentStatementPage.submitButton().click()
      incidentStatementPage
        .errorSummary()
        .find('li')
        .then($errors => {
          expect($errors.get(0).innerText).to.contain('Enter the details of the incident')
        })
    })
    it('should show validation message if a radio button was not chosen', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.statementTextArea().type('This is my statement')
      incidentStatementPage.submitButton().click()
      incidentStatementPage
        .errorSummary()
        .find('li')
        .then($errors => {
          expect($errors.get(0).innerText).to.contain('Select yes if you’ve completed your statement')
        })
    })
    it('should redirect the user to /check-your-answers if statement is complete', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.statementTextArea().type('John was badly behaved today.')
      incidentStatementPage.radioYes().check()
      incidentStatementPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.checkYourAnswers.urls.start(3456))
      })
    })
    it('should redirect the user to /place-the-prisoner-on-report if statement is incomplete', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.statementTextArea().type('This is my statement, it is not finished.')
      incidentStatementPage.radioNo().check()
      incidentStatementPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(3456))
      })
    })
  })
  context('Incident details present, offence details missing', () => {
    beforeEach(() => {
      cy.task('stubGetDraftAdjudication', {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:42',
              handoverDeadline: '2021-11-05T11:09:42',
              locationId: 234,
            },
            startedByUserId: 'USER1',
            incidentRole: {},
            offenceDetails: [],
          },
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
              handoverDeadline: '2021-11-05T11:09:42',
              locationId: 234,
            },
            startedByUserId: 'USER1',
            incidentStatement: {
              statement: 'This is my statement',
            },
            incidentRole: {},
            offenceDetails: [],
          },
        },
      })
      cy.signIn()
    })

    it('should contain the required page elements', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.statementTextArea().should('exist')
      incidentStatementPage.statementRadios().should('exist')
      incidentStatementPage.submitButton().should('exist')
    })

    it('should show validation message if there is no statement given', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.radioYes().check()
      incidentStatementPage.submitButton().click()
      incidentStatementPage
        .errorSummary()
        .find('li')
        .then($errors => {
          expect($errors.get(0).innerText).to.contain('Enter the details of the incident')
        })
    })
    it('should show validation message if a radio button was not chosen', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.statementTextArea().type('This is my statement')
      incidentStatementPage.submitButton().click()
      incidentStatementPage
        .errorSummary()
        .find('li')
        .then($errors => {
          expect($errors.get(0).innerText).to.contain('Select yes if you’ve completed your statement')
        })
    })
    it('should redirect the user to /place-the-prisoner-on-report if statement is complete', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.statementTextArea().type('John was badly behaved today.')
      incidentStatementPage.radioYes().check()
      incidentStatementPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(3456))
      })
    })
    it('should redirect the user to /place-the-prisoner-on-report if statement is incomplete', () => {
      cy.visit(adjudicationUrls.incidentStatement.urls.start(3456))
      const incidentStatementPage: IncidentStatement = Page.verifyOnPage(IncidentStatement)
      incidentStatementPage.statementTextArea().type('This is my statement, it is not finished.')
      incidentStatementPage.radioNo().check()
      incidentStatementPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.taskList.urls.start(3456))
      })
    })
  })
})
