import adjudicationUrls from '../../server/utils/urlGenerator'
import AssociatedPrisoner from '../pages/associatedPrisoner'
import Page from '../pages/page'

context('Incident assist submitted edit', () => {
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
        firstName: 'JAMES',
        lastName: 'BROWN',
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
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER2',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            associatedPrisonersName: null,
            roleCode: '25c',
          },
        },
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 35,
      response: {
        draftAdjudication: {
          id: 35,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 27029,
          },
          incidentStatement: {},
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER2',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            associatedPrisonersName: 'Someone Else',
            roleCode: '25c',
          },
        },
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 34,
      response: {
        draftAdjudication: {
          id: 35,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T11:09:42',
            locationId: 27029,
          },
          incidentStatement: {},
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER2',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            associatedPrisonersName: null,
            roleCode: '25c',
          },
        },
      },
    })
  })

  it('should contain the required page elements for internal prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.submittedEdit(34, 'assisted'))

    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().should('exist')
    associatedPrisonerPage.exitButton().should('exist')
    associatedPrisonerPage.submitButton().should('exist')

    associatedPrisonerPage.radioButtons().find('input[value="internal"]').should('be.checked')
    associatedPrisonerPage.radioButtons().find('input[value="external"]').should('not.be.checked')

    associatedPrisonerPage.internalNameInput().contains('Brown, James')
    associatedPrisonerPage.internalNumberInput().contains('T3356FU')
  })

  it('should contain the required page elements for external prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.submittedEdit(35, 'assisted'))

    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.radioButtons().should('exist')
    associatedPrisonerPage.exitButton().should('exist')
    associatedPrisonerPage.submitButton().should('exist')

    associatedPrisonerPage.radioButtons().find('input[value="internal"]').should('not.be.checked')
    associatedPrisonerPage.radioButtons().find('input[value="external"]').should('be.checked')

    associatedPrisonerPage.externalNameInput().should('have.value', 'Someone Else')
    associatedPrisonerPage.externalNumberInput().should('have.value', 'T3356FU')
  })

  it('should redirect the user to the task list page if they cancel', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.submittedEdit(35, 'assisted'))

    const incidentAssistPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    incidentAssistPage.exitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/35')
    })
  })

  it('should remember once it comes back to this page after deleting an associated prisoner', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
    associatedPrisonerPage.associatedPrisonerDeleteButton().click()
    cy.get('[data-qa="radio-buttons"]').find('input[value="yes"]').check()
    cy.get('[data-qa="delete-person-submit"]').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
      expect(loc.search).to.eq('?personDeleted=true')
    })
    associatedPrisonerPage.radioButtons().find('input[value="internal"]').should('be.checked')
    associatedPrisonerPage.associatedPrisonerDeleteButton().should('not.exist')
  })

  it('should show error summary if associated prisoner location changed to internal', () => {
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(35, 'assisted'))
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

  it('should show error summary if associated prisoner location changed to external', () => {
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

  context('Redirect on error', () => {
    beforeEach(() => {
      cy.task('stubUpdateDraftIncidentRole', { id: 34, response: {}, status: 500 })
    })
    it('should redirect back to incident details (edit) if an error occurs whilst calling the API', () => {
      cy.visit(
        `${adjudicationUrls.incidentAssociate.urls.submittedEdit(
          34,
          'assisted'
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      const associatedPrisonerPage: AssociatedPrisoner = Page.verifyOnPage(AssociatedPrisoner)
      associatedPrisonerPage.submitButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.not.eq(adjudicationUrls.prisonerReport.urls.report(1524455))
      })
      associatedPrisonerPage.errorContinueButton().click()
      cy.location().should(loc => {
        expect(loc.pathname).to.eq(adjudicationUrls.incidentAssociate.urls.submittedEdit(34, 'assisted'))
      })
    })
  })
})
