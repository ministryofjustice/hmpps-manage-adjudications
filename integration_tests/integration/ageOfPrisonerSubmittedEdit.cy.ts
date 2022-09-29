import adjudicationUrls from '../../server/utils/urlGenerator'
import AgeOfPrisoner from '../pages/ageofPrisonerSubmittedEdit'
import Page from '../pages/page'

context('Age of the prisoner', () => {
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
        dateOfBirth: '1990-10-11',
      },
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
            isYouthOffender: false,
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
          isYouthOffender: false,
        },
      },
    })
    cy.signIn()
  })

  it('should contain the required page elements', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.ageOfPrisoner().should('exist')
    ageOfPrisonerPage.ageOfPrisonerHint().should('exist')
    ageOfPrisonerPage.prisonRuleRadios().should('exist')
    ageOfPrisonerPage.submitButton().should('exist')
    ageOfPrisonerPage.cancelButton().should('exist')
  })
  it('should already have a radio button selected from their previous selection', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.prisonRuleRadios().find('input[value="adult"]').should('be.checked')
    ageOfPrisonerPage.submitButton().click()
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
      response: {
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
        assignedLivingUnit: { description: '1-2-015', agencyName: 'Moorland (HMPYOI)', agencyId: 'MDI' },
      },
    })
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.ageOfPrisoner().should('not.exist')
    ageOfPrisonerPage.ageOfPrisonerHint().should('not.exist')
  })
  it('should redirect the user to the role page if the page receives a valid submission', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.radioAdult().click()
    ageOfPrisonerPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentRole.urls.submittedEdit(3456))
    })
  })
  it('should redirect the user to the task list page if they cancel', () => {
    cy.visit(adjudicationUrls.ageOfPrisoner.urls.submittedEdit(3456))
    const ageOfPrisonerPage: AgeOfPrisoner = Page.verifyOnPage(AgeOfPrisoner)
    ageOfPrisonerPage.radioYoi().click()
    ageOfPrisonerPage.cancelButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/place-the-prisoner-on-report/3456')
    })
  })
})
