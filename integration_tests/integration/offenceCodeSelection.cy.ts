import OffenceCodeSelection from '../pages/offenceCodeSelection'
import Page from '../pages/page'
import DetailsOfOffence from '../pages/detailsOfOffence'
import CheckYourAnswersPage from '../pages/taskList'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const testData = new TestData()

const prisonerOutsideEstablishmentNumber = 'G7123CI'

context('Offence details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
    // Committed draft
    cy.task('stubGetDraftAdjudication', {
      id: 100,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 100,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T13:10:00',
        }),
      },
    })
    // Attempted draft
    cy.task('stubGetDraftAdjudication', {
      id: 101,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 101,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-03T13:10:00',
          incidentRole: {
            associatedPrisonersNumber: undefined,
            roleCode: '25a',
          },
        }),
      },
    })
    // Incited draft
    cy.task('stubGetDraftAdjudication', {
      id: 102,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 102,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-05T13:10:00',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25b',
          },
        }),
      },
    })
    // Assisted draft
    cy.task('stubGetDraftAdjudication', {
      id: 103,
      response: {
        draftAdjudication: testData.draftAdjudication({
          id: 103,
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-06T13:10:00',
          incidentRole: {
            associatedPrisonersNumber: 'T3356FU',
            roleCode: '25c',
          },
        }),
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
    // Associated Prisoner
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
    // Prison officer victim
    cy.task('stubGetUserFromUsername', {
      username: 'AOWENS',
      response: testData.userFromUsername('AOWENS'),
    })
    cy.task('stubGetEmail', {
      username: 'AOWENS',
      response: testData.emailFromUsername('AOWENS'),
    })
    // Staff victim
    cy.task('stubGetUserFromUsername', {
      username: 'CSTANLEY',
      response: testData.userFromUsername('CSTANLEY'),
    })
    cy.task('stubGetEmail', {
      username: 'CSTANLEY',
      response: testData.emailFromUsername('CSTANLEY'),
    })
    // Offence rules
    cy.task('stubGetOffenceRule', {
      offenceCode: 1006,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    // Offence rules
    cy.task('stubGetOffenceRule', {
      offenceCode: 1022,
      response: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    })
    // Prisoner-outside-establishment number validation
    cy.task('stubSearchPrisonerDetails', {
      prisonerNumber: prisonerOutsideEstablishmentNumber,
    })
  })
  it('the first page for committing an offence title', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    new OffenceCodeSelection('What type of offence did John Smith commit?').checkOnPage()
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(101, 'attempted', '1'))
    new OffenceCodeSelection('What type of offence did John Smith attempt to commit?').checkOnPage()
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(102, 'incited', '1'))
    new OffenceCodeSelection('What type of offence did John Smith incite another prisoner to commit?').checkOnPage()
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(103, 'assisted', '1'))
  })

  it('the cancel button', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.cancel().click()
    Page.verifyOnPage(CheckYourAnswersPage)
  })

  it('the first page should have the expected radios', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    // These are very specific to the current decision data so don't check too many.
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radios().should('exist')
    whatTypeOfOffencePage.radio('1-1').should('exist')
    whatTypeOfOffencePage
      .radioLabelFromValue('1-1')
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    whatTypeOfOffencePage.radio('1-1').should('exist')
    whatTypeOfOffencePage
      .radioLabelFromValue('1-9')
      .contains('Being absent without authorisation, being in an unauthorised place, or failing to work correctly')
  })

  it('check validation when there is no radio selected', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.continue().click()
    whatTypeOfOffencePage.form().contains('Select an option')
  })

  it('cancel', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.cancel().click()
    cy.url().should('include', 'place-the-prisoner-on-report/100')
  })

  it('select another radio and check that we get sent to the page we expect', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    // This is specific to the current decision data so only check one.
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').should('exist').check()
    whatTypeOfOffencePage
      .radioLabelFromValue('1-1')
      .contains('Assault, fighting, or endangering the health or personal safety of others')
    // Go to the next page
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve?')
    whatDidTheIncidentInvolve.radio('1-1-1').should('exist')
    whatDidTheIncidentInvolve.radioLabelFromValue('1-1-1').contains('Assaulting someone')
  })

  it('select a prisoner question', () => {
    const prisonerAnswerId = '1-1-1-1'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(prisonerAnswerId).check()
    whoWasAssaultedPage.radioLabelFromValue(prisonerAnswerId).contains('A prisoner in this establishment')
    whoWasAssaultedPage.victimPrisonerSearchInput().type('Paul Wright')
    whoWasAssaultedPage.searchPrisoner().click()
    cy.url().should('include', 'select-associated-prisoner?searchTerm=Paul%20Wright')
    whoWasAssaultedPage.simulateReturnFromPrisonerSearch(100, whoWasAssaultedQuestionId, prisonerAnswerId, 'G5512G')
    whoWasAssaultedPage.victimPrisonerHiddenInput().should('have.value', 'G5512G')
    whoWasAssaultedPage.victimPrisonerName().contains('Paul Wright')
    whoWasAssaultedPage.continue().click()
    const protectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    protectedCharacteristic.checkOnPage()
  })

  it('select a prisoner question - delete', () => {
    const prisonerAnswerId = '1-1-1-1'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.simulateReturnFromPrisonerSearch(100, whoWasAssaultedQuestionId, prisonerAnswerId, 'G5512G')
    whoWasAssaultedPage.victimPrisonerHiddenInput().should('have.value', 'G5512G')
    whoWasAssaultedPage.delete().click()
    whoWasAssaultedPage.victimPrisonerSearchInput().should('exist')
  })

  it('select a prisoner question - validation', () => {
    const prisonerAnswerId = '1-1-1-1'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(prisonerAnswerId).check()
    // Search without search text for validation
    whoWasAssaultedPage.searchPrisoner().click()
    whoWasAssaultedPage.form().contains('Enter the prisoner’s name or prison number')
    // Enter search text and submit instead of searching
    whoWasAssaultedPage.victimPrisonerSearchInput().type('Paul Wright')
    whoWasAssaultedPage.continue().click()
    whoWasAssaultedPage.form().contains('Search for a prisoner')
    whoWasAssaultedPage.victimPrisonerSearchInput().should('have.value', 'Paul Wright')
  })

  it('select an officer question', () => {
    const officerAnswerId = '1-1-1-2'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(officerAnswerId).check()
    whoWasAssaultedPage.radioLabelFromValue(officerAnswerId).contains('A prison officer')
    whoWasAssaultedPage.victimOfficerSearchNameInput().type('Test User')
    whoWasAssaultedPage.searchOfficer().click()
    cy.url().should('include', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=Test%20User`)
    whoWasAssaultedPage.simulateReturnFromStaffSearch(100, whoWasAssaultedQuestionId, officerAnswerId, 'AOWENS')
    whoWasAssaultedPage.victimOfficerPrisonerHiddenInput().should('have.value', 'AOWENS')
    whoWasAssaultedPage.victimOfficerName().contains('Test User')
    whoWasAssaultedPage.continue().click()
    const protectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    protectedCharacteristic.checkOnPage()
  })

  it('select an officer question - delete', () => {
    const officerAnswerId = '1-1-1-2'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.simulateReturnFromStaffSearch(100, whoWasAssaultedQuestionId, officerAnswerId, 'AOWENS')
    whoWasAssaultedPage.victimOfficerPrisonerHiddenInput().should('have.value', 'AOWENS')
    whoWasAssaultedPage.victimOfficerName().contains('Test User')
    whoWasAssaultedPage.delete().click()
    whoWasAssaultedPage.victimOfficerSearchNameInput().should('exist')
  })

  it('select an officer question - validation', () => {
    const officerAnswerId = '1-1-1-2'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(officerAnswerId).check()
    // Search without search text for validation
    whoWasAssaultedPage.searchOfficer().click()
    whoWasAssaultedPage.form().contains('Enter the person’s name')
    whoWasAssaultedPage.victimOfficerSearchNameInput().type('Adam Owens')
    whoWasAssaultedPage.searchOfficer().click()
    cy.url().should('include', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=Adam%20Owens`)
    // Enter search text and submit instead of searching
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    whoWasAssaultedPage.radio(officerAnswerId).check()
    whoWasAssaultedPage.victimOfficerSearchNameInput().type('Adam Owens')
    whoWasAssaultedPage.continue().click()
    whoWasAssaultedPage.form().contains('Search for a prison officer')
    whoWasAssaultedPage.victimOfficerSearchNameInput().should('have.value', 'Adam Owens')
  })
  it('select another person - validation', () => {
    const anotherPersonAnswerId = '1-1-1-5'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(anotherPersonAnswerId).check()
    // Submit without entering any text
    // Enter search text and submit instead of searching
    whoWasAssaultedPage.continue().click()
    whoWasAssaultedPage.form().contains('Enter the person’s name')
  })

  it('select another person question', () => {
    const anotherPersonAnswerId = '1-1-1-5'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(anotherPersonAnswerId).check()
    whoWasAssaultedPage.radioLabelFromValue(anotherPersonAnswerId).contains('A person not listed above')
    whoWasAssaultedPage.victimOtherPersonSearchNameInput().type('James Peterson')
    whoWasAssaultedPage.continue().click()
    const protectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    protectedCharacteristic.checkOnPage()
  })

  it('select a prisoner outside establishment question', () => {
    const prisonerOutsideEstablishmentAnswerId = '1-1-1-4'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(prisonerOutsideEstablishmentAnswerId).check()
    whoWasAssaultedPage
      .radioLabelFromValue(prisonerOutsideEstablishmentAnswerId)
      .contains('A prisoner who’s left this establishment')
    whoWasAssaultedPage.prisonerOutsideEstablishmentNameInput().type('James Robertson')
    whoWasAssaultedPage.prisonerOutsideEstablishmentNumberInput().type(prisonerOutsideEstablishmentNumber)
    whoWasAssaultedPage.continue().click()
    const protectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    protectedCharacteristic.checkOnPage()
  })

  it('select a prisoner outside establishment question - validation', () => {
    const prisonerOutsideEstablishmentAnswerId = '1-1-1-4'
    const whoWasAssaultedQuestionId = '1-1-1'
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', whoWasAssaultedQuestionId))
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio(prisonerOutsideEstablishmentAnswerId).check()
    whoWasAssaultedPage
      .radioLabelFromValue(prisonerOutsideEstablishmentAnswerId)
      .contains('A prisoner who’s left this establishment')
    whoWasAssaultedPage.continue().click()
    whoWasAssaultedPage.form().contains('Enter the prisoner’s name')
    whoWasAssaultedPage.form().contains('Enter their prison number')
    whoWasAssaultedPage.prisonerOutsideEstablishmentNameInput().type('James Robertson')
    whoWasAssaultedPage.prisonerOutsideEstablishmentNumberInput().type(prisonerOutsideEstablishmentNumber)
    whoWasAssaultedPage.continue().click()
    const protectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    protectedCharacteristic.checkOnPage()
  })

  it('end to end - staff search', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio('1-1-1-3').check()
    whoWasAssaultedPage.victimStaffSearchNameInput().type('Carl Stanley')
    whoWasAssaultedPage.searchStaff().click()
    cy.url().should('include', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=Carl%20Stanley`)
    whoWasAssaultedPage.simulateReturnFromStaffSearch(100, '1-1-1', '1-1-1-3', 'CSTANLEY')
    whoWasAssaultedPage.continue().click()
    const protectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    protectedCharacteristic.radio('1-1-1-3-2').click()
    whoWasAssaultedPage.continue().click()
    Page.verifyOnPage(DetailsOfOffence)
  })
  it('end to end - prisoner outside establishment', () => {
    cy.visit(adjudicationUrls.offenceCodeSelection.urls.question(100, 'committed', '1'))
    const whatTypeOfOffencePage = new OffenceCodeSelection('What type of offence did John Smith commit?')
    whatTypeOfOffencePage.radio('1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whatDidTheIncidentInvolve = new OffenceCodeSelection('What did the incident involve')
    whatDidTheIncidentInvolve.radio('1-1-1').check()
    whatTypeOfOffencePage.continue().click()
    const whoWasAssaultedPage = new OffenceCodeSelection('Who was assaulted?')
    whoWasAssaultedPage.radio('1-1-1-4').check()
    whoWasAssaultedPage.prisonerOutsideEstablishmentNameInput().type('James Robertson')
    whoWasAssaultedPage.prisonerOutsideEstablishmentNumberInput().type(prisonerOutsideEstablishmentNumber)
    whoWasAssaultedPage.continue().click()
    const protectedCharacteristic = new OffenceCodeSelection(
      'Was the incident aggravated by a protected characteristic?'
    )
    protectedCharacteristic.radio('1-1-1-4-2').click()
    whoWasAssaultedPage.continue().click()
    Page.verifyOnPage(DetailsOfOffence)
  })
})
