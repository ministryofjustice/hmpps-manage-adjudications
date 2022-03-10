import request from 'superagent'
import DetailsOfOffence from '../pages/detailsOfOffence'
import Page from '../pages/page'
import OffenceCodeSelection from '../pages/offenceCodeSelection'
import DeleteOffence from '../pages/deleteOffence'

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
    cy.visit(`/details-of-offence/300`)
    const detailsOfOffence = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffence.questionAnswerSectionAnswer(2, 2).contains('Fighting with someone')
    detailsOfOffence.deleteLink(2).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.questionAnswerSectionAnswer(2, 2).contains('Fighting with someone')
  })

  it('Go to the delete offence page and get a validation failure', () => {
    cy.visit(`/details-of-offence/300`)
    const detailsOfOffence = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffence.deleteLink(2).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.confirm().click()
    deleteOffence.form().contains('Please make a choice')
  })

  it('Go to the delete offence page and select yes', () => {
    cy.visit(`/details-of-offence/300`)
    const detailsOfOffence = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffence.questionAnswerSection(2).should('exist')
    detailsOfOffence.deleteLink(2).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.yesRadio().click()
    deleteOffence.confirm().click()
    detailsOfOffence.checkOnPage()
    detailsOfOffence.questionAnswerSection(2).should('not.exist')
  })

  it('Go to the delete offence page and select no', () => {
    cy.visit(`/details-of-offence/300`)
    const detailsOfOffence = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffence.questionAnswerSection(2).should('exist')
    detailsOfOffence.deleteLink(2).click()
    const deleteOffence = Page.verifyOnPage(DeleteOffence)
    deleteOffence.noRadio().click()
    deleteOffence.confirm().click()
    detailsOfOffence.checkOnPage()
    detailsOfOffence.questionAnswerSection(2).should('exist')
  })
})
//
// // Prisoner playback
// detailsOfOffence.prisonerNameDiv().contains('Smith, John')
// // Questions and Answers
// detailsOfOffence
//   .questionAnswerSectionQuestion(1, 1)
//   .contains('What type of offence did John Smith assist another prisoner to commit or attempt to commit?')
// detailsOfOffence
//   .questionAnswerSectionAnswer(1, 1)
//   .contains('Assault, fighting, or endangering the health or personal safety of others')
// detailsOfOffence.questionAnswerSectionQuestion(1, 2).contains('What did the incident involve?')
// detailsOfOffence.questionAnswerSectionAnswer(1, 2).contains('Assaulting someone')
// detailsOfOffence.questionAnswerSectionQuestion(1, 3).contains('Who did John Smith assist James Jones to assault?')
// detailsOfOffence.questionAnswerSectionAnswer(1, 3).contains('Another prisoner - Paul Wright')
// detailsOfOffence.questionAnswerSectionQuestion(1, 4).contains('Was the incident a racially aggravated assault?')
// detailsOfOffence.questionAnswerSectionAnswer(1, 4).contains('Yes')
// // Offence details
// detailsOfOffence.offenceSection(1).contains('Prison rule 51, paragraph 25(c)')
// detailsOfOffence
//   .offenceSection(1)
//   .contains('Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:')
// detailsOfOffence.offenceSection(1).contains('Prison rule 51, paragraph 1')
// detailsOfOffence.offenceSection(1).contains('Commits any assault')
// // Delete link
// detailsOfOffence.deleteLink(1).should('exist')
// })

// it('select multiple offences and see them all', () => {
//   cy.visit(`/offence-code-selection/200/assisted/1`)
//   const whatTypeOfOffencePage = new OffenceCodeSelection(
//     'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
//   )
//   whatTypeOfOffencePage.radio('1-1').check()
//   whatTypeOfOffencePage.continue().click()
//   const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve?')
//   whatDidTheIncidentInvolve.radio('1-1-2').check()
//   whatDidTheIncidentInvolve.continue().click()
//   // We should now be on the offence details page
//   const detailsOfOffence = Page.verifyOnPage(DetailsOfOffence)
//   // Add another offence
//   detailsOfOffence.addAnotherOffence().click()
//   const whatTypeOfOffencePage2 = new OffenceCodeSelection(
//     'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
//   )
//   whatTypeOfOffencePage2.radio('1-1').check()
//   whatTypeOfOffencePage2.continue().click()
//   const whatDidTheIncidentInvolve2 = new OffenceCodeSelection('What did the incident involve?')
//   whatDidTheIncidentInvolve2.radio('1-1-3').check()
//   whatDidTheIncidentInvolve2.continue().click()
//   // We should be on the offence details page again. There should be two offences.
//   detailsOfOffence.questionAnswerSectionAnswer(1, 2).contains('Fighting with someone')
//   detailsOfOffence.questionAnswerSectionAnswer(2, 2).contains('Endangering the health or personal safety of someone')
// })
//
// it('offence details page when there is already an offence saved', () => {
//   cy.visit(`/details-of-offence/201`)
//   const detailsOfOffence = Page.verifyOnPage(DetailsOfOffence)
//   detailsOfOffence.questionAnswerSectionQuestion(1, 1).contains('What type of offence did John Smith commit?')
//   detailsOfOffence
//     .questionAnswerSectionAnswer(1, 1)
//     .contains('Assault, fighting, or endangering the health or personal safety of others')
//   detailsOfOffence.questionAnswerSectionQuestion(1, 2).contains('What did the incident involve?')
//   detailsOfOffence.questionAnswerSectionAnswer(1, 2).contains('Assaulting someone')
//   detailsOfOffence.questionAnswerSectionQuestion(1, 3).contains('Who was assaulted?')
//   detailsOfOffence.questionAnswerSectionAnswer(1, 3).contains('Another prisoner - Paul Wright')
//   detailsOfOffence.offenceSection(1).contains('Prison rule 51, paragraph 1')
//   detailsOfOffence.offenceSection(1).contains('Commits any assault')
// })
//
// it('offence details saves as expected', () => {
//   cy.visit(`/details-of-offence/201`)
//   const detailsOfOffence = Page.verifyOnPage(DetailsOfOffence)
//   detailsOfOffence.saveAndContinue().click()
//   cy.task('verifySaveOffenceDetails', {
//     adjudicationNumber: 201,
//     offenceDetails: [
//       {
//         offenceCode: 1001,
//         victimPrisonersNumber: 'G5512G',
//       },
//     ],
//   }).then((val: request.Response) => {
//     expect(JSON.parse(val.text).count).to.equal(1)
//   })
// })
// })
