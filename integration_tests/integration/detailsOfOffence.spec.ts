import request from 'superagent'
import DetailsOfOffence from '../pages/detailsOfOffence'
import Page from '../pages/page'
import OffenceCodeSelection from '../pages/offenceCodeSelection'
import { detailsOfOffence, offenceCodeSelection } from '../../server/utils/urlGenerator'

context('Details of offence', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    // Draft to add offences to
    cy.task('stubGetDraftAdjudication', {
      id: 200,
      response: {
        draftAdjudication: {
          id: 200,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-06T13:10:00',
            handoverDeadline: '2021-11-08T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          prisonerNumber: 'G6415GD',
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
        },
      },
    })
    // Draft with saved offences
    cy.task('stubGetDraftAdjudication', {
      id: 201,
      response: {
        draftAdjudication: {
          id: 201,
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
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: {
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
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
      offenceCode: 5001,
      response: {
        paragraphNumber: '5',
        paragraphDescription:
          'Intentionally endangers the health or personal safety of others or, by their conduct, is reckless whether such health or personal safety is endangered',
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

  it('select and offence for the first time and see it on the offence details page.', () => {
    // Choose a complex offence so that we test all of the functionality.
    cy.visit(`${offenceCodeSelection.urls.start(200, 'assisted')}`)
    const whatTypeOfOffencePage = new OffenceCodeSelection(
      'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
    )
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve?')
    whatDidTheIncidentInvolve.radio('1-1-1').check()
    whatDidTheIncidentInvolve.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who did John Smith assist James Jones to assault?')
    whoWasAssaultedPage.radio('1-1-1-1').check()
    whoWasAssaultedPage.victimPrisonerSearchInput().type('Paul Wright')
    whoWasAssaultedPage.searchPrisoner().click()
    whoWasAssaultedPage.simulateReturnFromPrisonerSearch(200, '1-1-1', '1-1-1-1', 'G5512G')
    whoWasAssaultedPage.continue().click()
    const raciallyAggravated = new OffenceCodeSelection('Was the incident a racially aggravated assault?')
    raciallyAggravated.radio('1-1-1-1-1').click()
    whoWasAssaultedPage.continue().click()
    // We should now be on the offence details page.
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    // Prisoner playback
    detailsOfOffencePage.prisonerNameDiv().contains('Smith, John')
    // Questions and Answers
    detailsOfOffencePage
      .questionAnswerSectionQuestion(1, 1)
      .contains('What type of offence did John Smith assist another prisoner to commit or attempt to commit?')
    detailsOfOffencePage
      .questionAnswerSectionAnswer(1, 1)
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 2).contains('What did the incident involve?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 2).contains('Assaulting someone')
    detailsOfOffencePage
      .questionAnswerSectionQuestion(1, 3)
      .contains('Who did John Smith assist James Jones to assault?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 3).contains('Another prisoner - Paul Wright')
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 4).contains('Was the incident a racially aggravated assault?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 4).contains('Yes')
    // Offence details
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 25(c)')
    detailsOfOffencePage
      .offenceSection(1)
      .contains('Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:')
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 1')
    detailsOfOffencePage.offenceSection(1).contains('Commits any assault')
    // Delete link
    detailsOfOffencePage.deleteLink(1).should('exist')
  })

  it('select multiple offences and see them all', () => {
    cy.visit(`${offenceCodeSelection.urls.start(200, 'assisted')}`)
    const whatTypeOfOffencePage = new OffenceCodeSelection(
      'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
    )
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve?')
    whatDidTheIncidentInvolve.radio('1-1-2').check()
    whatDidTheIncidentInvolve.continue().click()
    // We should now be on the offence details page
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    // Add another offence
    detailsOfOffencePage.addAnotherOffence().click()
    const whatTypeOfOffencePage2 = new OffenceCodeSelection(
      'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
    )
    whatTypeOfOffencePage2.radio('1-1').check()
    whatTypeOfOffencePage2.continue().click()
    const whatDidTheIncidentInvolve2 = new OffenceCodeSelection('What did the incident involve?')
    whatDidTheIncidentInvolve2.radio('1-1-3').check()
    whatDidTheIncidentInvolve2.continue().click()
    // We should be on the offence details page again. There should be two offences.
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 2).contains('Fighting with someone')
    detailsOfOffencePage
      .questionAnswerSectionAnswer(2, 2)
      .contains('Endangering the health or personal safety of someone')
  })

  it('offence details page when there is already an offence saved', () => {
    cy.visit(`${detailsOfOffence.urls.start(201)}`)
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 1).contains('What type of offence did John Smith commit?')
    detailsOfOffencePage
      .questionAnswerSectionAnswer(1, 1)
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 2).contains('What did the incident involve?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 2).contains('Assaulting someone')
    detailsOfOffencePage.questionAnswerSectionQuestion(1, 3).contains('Who was assaulted?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 3).contains('Another prisoner - Paul Wright')
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 1')
    detailsOfOffencePage.offenceSection(1).contains('Commits any assault')
  })

  it('offence details page when there is no offences', () => {
    cy.visit(`${detailsOfOffence.urls.start(200)}`)
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.continue().click()
    new OffenceCodeSelection(
      'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
    ).checkOnPage()
  })

  it('offence details saves as expected', () => {
    cy.visit(`${detailsOfOffence.urls.start(201)}`)
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.saveAndContinue().click()
    cy.task('verifySaveOffenceDetails', {
      adjudicationNumber: 201,
      offenceDetails: [
        {
          offenceCode: 1001,
          victimPrisonersNumber: 'G5512G',
        },
      ],
    }).then((val: request.Response) => {
      expect(JSON.parse(val.text).count).to.equal(1)
    })
  })
})
