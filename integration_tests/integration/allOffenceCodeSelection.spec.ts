import OffenceCodeSelection from '../pages/offenceCodeSelection'
import Page from '../pages/page'
import DetailsOfOffence from '../pages/detailsOfOffence'
import CheckYourAnswersPage from '../pages/taskList'
import { offenceCodeSelection } from '../../server/utils/urlGenerator'

context('Incident details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    cy.task('stubGetDraftAdjudication', {
      id: 100,
      response: {
        draftAdjudication: {
          id: 100,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T13:10:00',
            handoverDeadline: '2021-11-05T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          prisonerNumber: 'G6415GD',
          startedByUserId: 'USER1',
          incidentRole: {
            associatedPrisonersNumber: undefined,
            roleCode: undefined,
          },
        },
      },
    })
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
    // Prison officer victim
    cy.task('stubGetUserFromUsername', {
      username: 'AOWENS',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Adam Owens',
        username: 'AOWENS',
        authSource: 'auth',
      },
    })
    cy.task('stubGetEmail', {
      username: 'AOWENS',
      response: {
        username: 'AOWENS',
        email: 'aowens@justice.gov.uk',
      },
    })
    // Staff victim
    cy.task('stubGetUserFromUsername', {
      username: 'CSTANLEY',
      response: {
        activeCaseLoadId: 'MDI',
        name: 'Carl Stanley',
        username: 'CSTANLEY',
        authSource: 'auth',
      },
    })
    cy.task('stubGetEmail', {
      username: 'CSTANLEY',
      response: {
        username: 'AOWENS',
        email: 'cstanley@justice.gov.uk',
      },
    })
  })
  it('check all offence codes', () => {
    cy.visit(`/offence-code-selection/100/committed/1`)
    const page = new OffenceCodeSelection('What type of offence did John Smith commit?')
    page.radioLabelFromText('Assault, fighting, or endangering the health or personal safety of others').click()
    page.continue().click()
    page.radioLabelFromText('Assaulting someone').click()
    page.continue().click()
    page.radioLabelFromText('Another prisoner').click()
    page.simulateReturnFromPrisonerSearch(100, '1-1-1', '1-1-1-1', 'G5512G')
    page.continue().click()
    page.checkOffenceCode(1001, 'Yes')
  })
})
