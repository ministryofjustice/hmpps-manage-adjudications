import TestData from '../../server/routes/testutils/testData'
import adjudicationUrls from '../../server/utils/urlGenerator'
import AssociatedPrisoner from '../pages/associatedPrisoner'
import Page from '../pages/page'

const testData = new TestData()

context('Incident assist', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'John',
        lastName: 'Rich',
      }),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 34,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 34,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T11:09:42',
        }),
      },
    })
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'T3356FU',
        prisonIds: ['MDI'],
      },
      results: [
        testData.prisonerSearchSummary({
          firstName: 'JAMES',
          lastName: 'JONES',
          prisonerNumber: 'T3356FU',
        }),
      ],
    })
    cy.task('stubSaveAssociatedPrisoner', {
      adjudicationNumber: 34,
    })
    cy.task('stubSearchPrisonerDetails', {
      prisonerNumber: 'T3356FU',
    })
    cy.task('stubSearchPrisonerDetails', {
      prisonerNumber: 'T3356FT',
      status: 404,
    })
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().should('exist')
    associatedPrisonerPage.exitButton().should('exist')
    associatedPrisonerPage.submitButton().should('exist')

    associatedPrisonerPage.radioButtons().find('input[value="internal"]').should('not.be.checked')
    associatedPrisonerPage.radioButtons().find('input[value="external"]').should('not.be.checked')
  })

  it('should redirect the user to the task list page if they cancel', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/34')
    })
  })

  it('should submit form successfully if all data entered - associated prisoner required - internal prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().find('input[value="internal"]').check()
    associatedPrisonerPage.conditionalInputInternal().type('T3356FU')
    associatedPrisonerPage.searchButton().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    associatedPrisonerPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question('34', 'assisted', '1'))
    })
  })

  it('should submit form successfully if all data entered - associated prisoner required - external prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().find('input[value="external"]').check()
    associatedPrisonerPage.externalNameInput().type('Bla Blah')
    associatedPrisonerPage.externalNumberInput().type('T3356FU')

    associatedPrisonerPage.submitButton().click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question('34', 'assisted', '1'))
    })
  })

  it('shouldthrow an error if prisoner not on file - associated prisoner required - external prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().find('input[value="external"]').check()
    associatedPrisonerPage.externalNameInput().type('Bla Blah')
    associatedPrisonerPage.externalNumberInput().type('T3356FT')

    associatedPrisonerPage.submitButton().click()

    associatedPrisonerPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('The prison number you have entered does not match a prisoner')
      })
  })

  it('should show error summary if an internal associated prisoner is not entered when searching', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().find('input[value="internal"]').check()
    associatedPrisonerPage.searchButton().click()
    associatedPrisonerPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the prisoner’s name or number')
      })
  })

  it('should show error summary if an internal associated prisoner is not entered', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().find('input[value="internal"]').check()
    associatedPrisonerPage.submitButton().click()
    associatedPrisonerPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the prisoner’s name or number')
      })
  })

  it('should show error summary if an extenal associated prisoner is not entered', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().find('input[value="external"]').check()
    associatedPrisonerPage.submitButton().click()
    associatedPrisonerPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the prisoner’s number')
        expect($errors.get(1).innerText).to.contain('Enter the prisoner’s name')
      })
  })
})
