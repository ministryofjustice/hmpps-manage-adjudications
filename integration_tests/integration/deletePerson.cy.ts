import DeletePerson from '../pages/deletePerson'
import Page from '../pages/page'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

context('Delete person - page contents', () => {
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
    cy.task('stubGetEmail', {
      username: 'TEST_GEN',
      response: {
        username: 'TEST_GEN',
        email: 'test@justice.gov.uk',
        verified: true,
      },
    })

    cy.signIn()
  })
  it('should contain the required page elements - prn provided', () => {
    cy.visit(`${adjudicationUrls.deletePerson.root}?associatedPersonId=G6415GD`)
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.radioButtons().should('exist')
    DeletePersonPage.radioButtonLegend().should('exist')
    DeletePersonPage.radioButtonLegend().contains('Do you want to delete John Smith?')
    DeletePersonPage.submitButton().should('exist')
    DeletePersonPage.errorSummary().should('not.exist')
  })
  it('should contain the required page elements - username provided', () => {
    cy.visit(`${adjudicationUrls.deletePerson.root}?associatedPersonId=TEST_GEN`)
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.radioButtons().should('exist')
    DeletePersonPage.radioButtonLegend().should('exist')
    DeletePersonPage.radioButtonLegend().contains('Do you want to delete Test User?')
    DeletePersonPage.submitButton().should('exist')
    DeletePersonPage.errorSummary().should('not.exist')
  })
  it('should show error message if no radio is selected', () => {
    cy.visit(`${adjudicationUrls.deletePerson.root}?associatedPersonId=G6415GD`)
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.submitButton().click()
    DeletePersonPage.errorSummary().should('exist')
    DeletePersonPage.errorSummary().contains('Select yes if you want to delete this person')
  })
})

context('Delete person - full journey', () => {
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

    cy.task('stubGetUserFromUsername', {
      username: 'TEST_GEN',
      response: testData.userFromUsername('TEST_GEN'),
    })
    cy.task('stubGetEmail', {
      username: 'TEST_GEN',
      response: testData.emailFromUsername('TEST_GEN'),
    })
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6123VU',
      response: testData.prisonerResultSummary({ offenderNo: 'G6123VU', firstName: 'JAMES', lastName: 'JONES' }),
    })
    cy.task('stubGetDraftAdjudication', {
      id: 34,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 34,
          prisonerNumber: 'G6123VU',
          incidentRole: {
            associatedPrisonersNumber: 'G6415GD',
            roleCode: '25b',
          },
        }),
      },
    })
    cy.task('stubGetLocations', {
      agencyId: 'MDI',
      response: testData.residentialLocations(),
    })
    cy.task('stubGetUserFromUsername', {
      username: 'USER1',
      response: testData.userFromUsername(),
    })
    cy.signIn()
  })
  it('should redirect to redirectUrl with correct query attached - yes selected', () => {
    // start on previous page to place redirectUrl on to session
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    cy.get('button[name="deleteUser"]').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(`${adjudicationUrls.deletePerson.root}`)
      expect(loc.search).to.eq('?associatedPersonId=G6415GD')
    })
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.radioButtons().find('input[value="yes"]').check()
    DeletePersonPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
      expect(loc.search).to.eq('?personDeleted=true')
    })
  })
  it('should redirect to redirectUrl with correct query attached - no selected', () => {
    // start on previous page to place redirectUrl on to session
    cy.visit(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
    cy.get('button[name="deleteUser"]').click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(`${adjudicationUrls.deletePerson.root}`)
      expect(loc.search).to.eq('?associatedPersonId=G6415GD')
    })
    const DeletePersonPage: DeletePerson = Page.verifyOnPage(DeletePerson)

    DeletePersonPage.radioButtons().find('input[value="no"]').check()
    DeletePersonPage.submitButton().click()
    cy.location().should(loc => {
      expect(loc.pathname).to.eq(adjudicationUrls.incidentAssociate.urls.start(34, 'assisted'))
      expect(loc.search).to.eq('?selectedPerson=G6415GD')
    })
  })
})
