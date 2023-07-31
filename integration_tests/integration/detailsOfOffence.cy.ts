import request from 'superagent'
import DetailsOfOffence from '../pages/detailsOfOffence'
import Page from '../pages/page'
import OffenceCodeSelection from '../pages/offenceCodeSelection'
import adjudicationUrls from '../../server/utils/urlGenerator'
import DeleteOffence from '../pages/deleteOffence'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

const adjudicationWithOffences = testData.draftAdjudication({
  id: 201,
  prisonerNumber: 'G6415GD',
  offenceDetails: {
    offenceCode: 1001,
    offenceRule: {
      paragraphNumber: '1',
      paragraphDescription: 'Commits any assault',
    },
    victimPrisonersNumber: 'G5512G',
  },
})

const reportedAdjudicationWithOffences = testData.reportedAdjudication({
  otherData: {
    id: 202,
  },
  adjudicationNumber: 1234,
  chargeNumber: '1234',
  prisonerNumber: 'G6415GD',
  offenceDetails: {
    offenceCode: 1001,
    offenceRule: {
      paragraphNumber: '1',
      paragraphDescription: 'Commits any assault',
    },
    victimPrisonersNumber: 'G5512G',
  },
})

const reportedAdjudicationWithOffencesAloEdited = testData.reportedAdjudication({
  otherData: {
    id: 201,
  },
  adjudicationNumber: 12345,
  chargeNumber: '12345',
  prisonerNumber: 'G6415GD',
  offenceDetails: {
    offenceCode: 4001,
    offenceRule: {
      paragraphNumber: '4',
      paragraphDescription: 'Fights with any person',
    },
    victimPrisonersNumber: 'G5512G',
  },
})

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
        draftAdjudication: testData.draftAdjudication({
          id: 200,
          prisonerNumber: 'G6415GD',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25c',
            offenceRule: {
              paragraphNumber: '25(c)',
              paragraphDescription:
                'Assists another prisoner to commit, <br>or to attempt to commit, any of the foregoing offences:',
            },
          },
        }),
      },
    })
    cy.task('stubGetDraftAdjudication', {
      id: 404,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 404,
          prisonerNumber: 'G6415GD',
        }),
      },
    })
    // Draft with saved offences
    cy.task('stubGetDraftAdjudication', {
      id: 201,
      response: {
        draftAdjudication: adjudicationWithOffences,
      },
    })
    // Reported draft
    cy.task('stubGetDraftAdjudication', {
      id: 202,
      response: {
        draftAdjudication: reportedAdjudicationWithOffences,
      },
    })

    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
      }),
    })
    // Associated prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'T3356FU',
      response: testData.prisonerResultSummary({
        offenderNo: 'T3356FU',
        firstName: 'JAMES',
        lastName: 'JONES',
      }),
    })
    // Prisoner victim
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G5512G',
      response: testData.prisonerResultSummary({
        offenderNo: 'G5512G',
        firstName: 'PAUL',
        lastName: 'WRIGHT',
      }),
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 1001,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    cy.task('stubGetOffenceRule', {
      offenceCode: 1002,
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
    cy.task('stubGetOffenceRule', {
      offenceCode: 5001,
      response: {
        paragraphNumber: '5',
        paragraphDescription:
          'Intentionally endangers the health or personal safety of others or, by their conduct, is reckless whether such health or personal safety is endangered',
      },
    })
    cy.task('stubSaveOffenceDetails', {
      adjudicationNumber: 201,
      response: adjudicationWithOffences,
    })
    cy.task('stubSaveOffenceDetails', {
      adjudicationNumber: 202,
      response: reportedAdjudicationWithOffences,
    })
    cy.task('stubAloAmendOffenceDetails', {
      adjudicationNumber: 201,
      response: reportedAdjudicationWithOffencesAloEdited,
    })
  })

  it('select an offence for the first time and see it on the offence details page - assault.', () => {
    // Choose a complex offence so that we test all of the functionality.
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.start('200', 'assisted'))
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

  it('select an offence for the first time and see it on the offence details page. - endanger', () => {
    // Choose a complex offence so that we test all of the functionality.
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.start('200', 'assisted'))
    const whatTypeOfOffencePage = new OffenceCodeSelection(
      'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
    )
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve?')
    whatDidTheIncidentInvolve.radio('1-1-3').check()
    whatDidTheIncidentInvolve.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who did John Smith assist James Jones to endanger?')
    whoWasAssaultedPage.radio('1-1-3-1').check()
    whoWasAssaultedPage.victimPrisonerSearchInput().type('Paul Wright')
    whoWasAssaultedPage.searchPrisoner().click()
    whoWasAssaultedPage.simulateReturnFromPrisonerSearch(200, '1-1-3', '1-1-3-1', 'G5512G')
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
    detailsOfOffencePage
      .questionAnswerSectionAnswer(1, 2)
      .contains('Endangering the health or personal safety of someone')
    detailsOfOffencePage
      .questionAnswerSectionQuestion(1, 3)
      .contains('Who did John Smith assist James Jones to endanger?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 3).contains('Another prisoner - Paul Wright')
    // Offence details
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 25(c)')
    detailsOfOffencePage
      .offenceSection(1)
      .contains('Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:')
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 5')
    detailsOfOffencePage
      .offenceSection(1)
      .contains(
        'Intentionally endangers the health or personal safety of others or, by their conduct, is reckless whether such health or personal safety is endangered'
      )
    // Delete link
    detailsOfOffencePage.deleteLink(1).should('exist')
  })

  it('select an offence for the first time and see it on the offence details page. - fighting', () => {
    // Choose a complex offence so that we test all of the functionality.
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.start('200', 'assisted'))
    const whatTypeOfOffencePage = new OffenceCodeSelection(
      'What type of offence did John Smith assist another prisoner to commit or attempt to commit?'
    )
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve?')
    whatDidTheIncidentInvolve.radio('1-1-2').check()
    whatDidTheIncidentInvolve.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who did John Smith assist James Jones to fight with?')
    whoWasAssaultedPage.radio('1-1-2-1').check()
    whoWasAssaultedPage.victimPrisonerSearchInput().type('Paul Wright')
    whoWasAssaultedPage.searchPrisoner().click()
    whoWasAssaultedPage.simulateReturnFromPrisonerSearch(200, '1-1-2', '1-1-2-1', 'G5512G')
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
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 2).contains('Fighting with someone')
    detailsOfOffencePage
      .questionAnswerSectionQuestion(1, 3)
      .contains('Who did John Smith assist James Jones to fight with?')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 3).contains('Another prisoner - Paul Wright')
    // Offence details
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 25(c)')
    detailsOfOffencePage
      .offenceSection(1)
      .contains('Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences:')
    detailsOfOffencePage.offenceSection(1).contains('Prison rule 51, paragraph 4')
    detailsOfOffencePage.offenceSection(1).contains('Fights with any person')
    // Delete link
    detailsOfOffencePage.deleteLink(1).should('exist')
  })

  it('should replace existing offences if a new offence is added', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.start('200', 'assisted'))
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
    const wasItRaciallyAggravated = new OffenceCodeSelection('Was the incident a racially aggravated assault?')
    wasItRaciallyAggravated.radio('1-1-1-1-1').check()
    wasItRaciallyAggravated.continue().click()
    // We should now be on the offence details page
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    // Try to add another offence
    cy.go('back')
    const racialPage = new OffenceCodeSelection('Was the incident a racially aggravated assault?')
    racialPage.radio('1-1-1-1-2').check()
    racialPage.continue().click()
    Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 1).should('exist')
    detailsOfOffencePage.questionAnswerSectionAnswer(1, 4).should('contain', 'No')
    detailsOfOffencePage.questionAnswerSection(2).should('not.exist')
  })

  it('offence details page when there is already an offence saved', () => {
    cy.visit(adjudicationUrls.detailsOfOffence.urls.start(201))
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
    detailsOfOffencePage.prisonRule().contains('Which set of rules apply to this prisoner?')
    detailsOfOffencePage.prisonRuleDesc().contains('Adult offences')
    detailsOfOffencePage.prisonRulePara().contains('Prison rule 51')
  })

  it('offence details page when there is no offences, rules or roles', () => {
    cy.visit(adjudicationUrls.detailsOfOffence.urls.start(202))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.deleteLink(1).click()
    const deleteOffencePage = Page.verifyOnPage(DeleteOffence)
    deleteOffencePage.yesRadio().click()
    deleteOffencePage.confirm().click()
    const editedDetailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    editedDetailsOfOffencePage.continue().click()
    cy.url().should('include', adjudicationUrls.ageOfPrisoner.urls.start(202))
  })

  it('offence details saves as expected', () => {
    // The add page saves the offence data then redirects to the offence page
    cy.visit(`${adjudicationUrls.detailsOfOffence.urls.add(201)}?offenceCode=4001`)
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.saveAndContinue().click()
    cy.task('verifySaveOffenceDetails', {
      adjudicationNumber: 201,
      offenceDetails: {
        offenceCode: 4001,
      },
    }).then((val: request.Response) => {
      expect(JSON.parse(val.text).count).to.equal(1)
    })
  })

  it('goes to the damages page', () => {
    cy.visit(adjudicationUrls.detailsOfOffence.urls.start(202))
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.saveAndContinue().click()
    cy.url().should('include', adjudicationUrls.detailsOfDamages.urls.start(202))
  })

  it('When an ALO has edited the offence, it should redirect back to the prisoner report page', () => {
    cy.visit(`${adjudicationUrls.detailsOfOffence.urls.aloEdit(201)}?offenceCode=4001`)
    const detailsOfOffencePage = Page.verifyOnPage(DetailsOfOffence)
    detailsOfOffencePage.saveAndContinue().click()
    cy.url().should('include', adjudicationUrls.prisonerReport.urls.review('12345'))
  })
})
