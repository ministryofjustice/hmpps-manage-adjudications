import adjudicationUrls from '../../server/utils/urlGenerator'
import AssociatePrisoner from '../pages/associatePrisoner'
import Page from '../pages/page'

context('Incident assist', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
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
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: {
        offenderNo: 'T3356FU',
        firstName: 'Rishi',
        lastName: 'Rich',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
        categoryCode: 'C',
        alerts: [
          { alertType: 'T', alertCode: 'TCPA' },
          { alertType: 'X', alertCode: 'XCU' },
        ],
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 34,
      response: {
        draftAdjudication: {
          id: 34,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 27029,
          },
          incidentStatement: {},
          incidentRole: {
            role: 'assisted',
          },
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER2',
        },
      },
    })
    cy.task('stubSearch', {
      query: {
        includeAliases: false,
        prisonerIdentifier: 'T3356FU',
        prisonIds: ['MDI'],
      },
      results: [
        {
          cellLocation: '1-2-015',
          firstName: 'JAMES',
          lastName: 'JONES',
          prisonerNumber: 'T3356FU',
          prisonName: 'HMP Moorland',
        },
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

    const associatePrisonerPage: AssociatePrisoner = Page.verifyOnPage(AssociatePrisoner)
    associatePrisonerPage.radioButtons().should('exist')
    associatePrisonerPage.exitButton().should('exist')
    associatePrisonerPage.submitButton().should('exist')

    associatePrisonerPage.radioButtons().find('input[value="internal"]').should('not.be.checked')
    associatePrisonerPage.radioButtons().find('input[value="external"]').should('not.be.checked')
  })

  it('should redirect the user to the task list page if they cancel', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatePrisonerPage: AssociatePrisoner = Page.verifyOnPage(AssociatePrisoner)
    associatePrisonerPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/34')
    })
  })

  it('should submit form successfully if all data entered - associated prisoner required - internal prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatePrisonerPage: AssociatePrisoner = Page.verifyOnPage(AssociatePrisoner)
    associatePrisonerPage.radioButtons().find('input[value="internal"]').check()
    associatePrisonerPage.conditionalInputInternal().type('T3356FU')
    associatePrisonerPage.searchButton().click()
    cy.get('[data-qa="select-prisoner-link"]').click()
    associatePrisonerPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'assisted', '1'))
    })
  })

  it('should submit form successfully if all data entered - associated prisoner required - external prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatePrisonerPage: AssociatePrisoner = Page.verifyOnPage(AssociatePrisoner)
    associatePrisonerPage.radioButtons().find('input[value="external"]').check()
    associatePrisonerPage.externalNameInput().type('Bla Blah')
    associatePrisonerPage.externalNumberInput().type('T3356FU')

    associatePrisonerPage.submitButton().click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.offenceCodeSelection.urls.question(34, 'assisted', '1'))
    })
  })

  it('shouldthrow an error if prisoner not on file - associated prisoner required - external prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))

    const associatePrisonerPage: AssociatePrisoner = Page.verifyOnPage(AssociatePrisoner)
    associatePrisonerPage.radioButtons().find('input[value="external"]').check()
    associatePrisonerPage.externalNameInput().type('Bla Blah')
    associatePrisonerPage.externalNumberInput().type('T3356FT')

    associatePrisonerPage.submitButton().click()

    associatePrisonerPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('The prison number you have entered does not match a prisoner')
      })
  })

  it('should show error summary if an internal associated prisoner is not entered', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    const associatePrisonerPage: AssociatePrisoner = Page.verifyOnPage(AssociatePrisoner)
    associatePrisonerPage.radioButtons().find('input[value="internal"]').check()
    associatePrisonerPage.submitButton().click()
    associatePrisonerPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the prisoner’s name or number')
      })
  })

  it('should show error summary if an extenal associated prisoner is not entered', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    const associatePrisonerPage: AssociatePrisoner = Page.verifyOnPage(AssociatePrisoner)
    associatePrisonerPage.radioButtons().find('input[value="external"]').check()
    associatePrisonerPage.submitButton().click()
    associatePrisonerPage
      .errorSummary()
      .find('li')
      .then($errors => {
        expect($errors.get(0).innerText).to.contain('Enter the prisoner’s number')
        expect($errors.get(1).innerText).to.contain('Enter the prisoner’s name')
      })
  })
})
