import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AgeOfPrisoner from '../pages/ageofPrisoner'
import Page from '../pages/page'

const testData = new TestData()

context('Age of the prisoner', () => {
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
    cy.task('stubSaveYouthOffenderStatus', {
      adjudicationNumber: '3456',
      response: {
        id: 3456,
        response: {
          draftAdjudication: {
            id: 3456,
            prisonerNumber: 'G6415GD',
            incidentDetails: {
              dateTimeOfIncident: '2021-11-03T11:09:00',
              handoverDeadline: '2021-11-05T11:09:00',
              locationId: 234,
            },
            startedByUserId: 'TEST_GEN',
          },
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
            dateTimeOfIncident: '2021-11-03T11:09:00',
            handoverDeadline: '2021-11-05T11:09:00',
            locationId: 234,
          },
          startedByUserId: 'TEST_GEN',
        },
      },
    })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.ageOfPrisoner().should('exist')
    ageOfPrisonerPage.ageOfPrisonerHint().should('exist')
    ageOfPrisonerPage.prisonRuleRadios().should('exist')
    ageOfPrisonerPage.submitButton().should('exist')
    ageOfPrisonerPage.cancelButton().should('exist')
  })
  it('should show validation message if there is no radio button selected', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.submitButton().click()
    ageOfPrisonerPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Select which rules apply')
      })
  })
  it('should show the correct age of the prisoner based on the date of the incident report', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.ageOfPrisoner().should('have.text', '31 years, 0 months')
  })
  it('should not show the age of the prisoner if there are no date of birth details on the prisoner record', () => {
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        includeBirthday: false,
      }),
    })
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.ageOfPrisoner().should('not.exist')
    ageOfPrisonerPage.ageOfPrisonerHint().should('not.exist')
  })
  it('should redirect the user to the role page if the page receives a valid submission', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.radioAdult().click()
    ageOfPrisonerPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.start(3456))
    })
  })
  it('should redirect the user to the task list page if they cancel', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.start(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.radioYoi().click()
    ageOfPrisonerPage.cancelButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/3456')
    })
  })
})
