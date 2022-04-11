import DetailsOfOffence from '../pages/detailsOfOffence'
import Page from '../pages/page'
import DeleteOffence from '../pages/deleteOffence'
import { detailsOfOffence } from '../../server/utils/urlGenerator'

context('Incident details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    // Draft with saved offences
    cy.task('stubGetDraftAdjudication', {
      id: 300,
      response: {
        draftAdjudication: {
          id: 300,
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
          offenceDetails: [
            {
              offenceCode: 1001,
              offenceRule: {
                paragraphNumber: '1',
                paragraphDescription: 'Commits any assault',
              },
              victimPrisonersNumber: 'G5512G',
            },
            {
              offenceCode: 4001,
              offenceRule: {
                paragraphNumber: '4',
                paragraphDescription: 'Fights with any person',
              },
              victimPrisonersNumber: 'G5512G',
            },
          ],
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
    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 4001,
      response: {
        paragraphNumber: '4',
        paragraphDescription: 'Fights with any person',
      },
    })
  })

  it('Go to the delete offence page', () => {
    cy.visit(detailsOfOffence.urls.start(300))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.questionAnswerSectionAnswer(2, 2).contains('Fighting with someone')
    detailsOfOffencePage.deleteLink(2).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.questionAnswerSectionAnswer(2, 2).contains('Fighting with someone')
  })

  it('Go to the delete offence page and get a validation failure', () => {
    cy.visit(detailsOfOffence.urls.start(300))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.deleteLink(2).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.confirm().click()
    deleteOffence.form().contains('Please make a choice')
  })

  it('Go to the delete offence page and select yes', () => {
    cy.visit(detailsOfOffence.urls.start(300))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.questionAnswerSection(2).should('exist')
    detailsOfOffencePage.deleteLink(2).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.yesRadio().click()
    deleteOffence.confirm().click()
    detailsOfOffencePage.checkOnPage()
    detailsOfOffencePage.questionAnswerSection(2).should('not.exist')
  })

  it('Go to the delete offence page and select no', () => {
    cy.visit(detailsOfOffence.urls.start(300))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.questionAnswerSection(2).should('exist')
    detailsOfOffencePage.deleteLink(2).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.noRadio().click()
    deleteOffence.confirm().click()
    detailsOfOffencePage.checkOnPage()
    detailsOfOffencePage.questionAnswerSection(2).should('exist')
  })
})
