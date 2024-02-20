import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AgeOfPrisoner from '../pages/ageofPrisonerSubmittedEdit'
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
      id: 3456,
      response: testData.draftAdjudication({
        id: 3456,
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2021-11-03T11:09:00',
      }),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 3456,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 3456,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T11:09:00',
        }),
      },
    })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.ageOfPrisoner().should('exist')
    ageOfPrisonerPage.ageOfPrisonerHint().should('exist')
    ageOfPrisonerPage.yoiRemandHint().should('exist')
    ageOfPrisonerPage.prisonRuleRadios().should('exist')
    ageOfPrisonerPage.submitButton().should('exist')
    ageOfPrisonerPage.cancelButton().should('exist')
  })
  it('should already have a radio button selected from their previous selection', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.prisonRuleRadios().find('input[value="adult"]').should('be.checked')
    ageOfPrisonerPage.submitButton().click({ force: true })
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.submittedEdit(3456))
    })
  })
  it('should show the correct age of the prisoner based on the date of the incident report', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
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
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.ageOfPrisoner().should('not.exist')
    ageOfPrisonerPage.ageOfPrisonerHint().should('not.exist')
    ageOfPrisonerPage.yoiRemandHint().should('exist')
  })
  it('should redirect the user to the role page if the page receives a valid submission', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.radioAdult().click({ force: true })
    ageOfPrisonerPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.submittedEdit(3456))
    })
  })
  it('should redirect the user to the task list page if they cancel', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.radioYoi().click({ force: true })
    ageOfPrisonerPage.cancelButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/3456')
    })
  })
})
