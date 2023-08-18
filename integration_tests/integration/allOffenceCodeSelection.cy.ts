import OffenceCodeSelection from '../pages/offenceCodeSelection'
import adjudicationUrls from '../../server/utils/urlGenerator'
import TestData from '../../server/routes/testutils/testData'

const prisonerOutsideEstablishmentNumber = 'G7123CI'

const testData = new TestData()

context('Incident details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
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
    // Prisoner
    cy.task('stubGetPrisonerDetails', {
      prisonerNumber: 'G6415GD',
      response: testData.prisonerResultSummary({
        offenderNo: 'G6415GD',
        firstName: 'JOHN',
        lastName: 'SMITH',
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
    // Prisoner-outside-establishment number validation
    cy.task('stubSearchPrisonerDetails', {
      prisonerNumber: prisonerOutsideEstablishmentNumber,
    })
  })
  it('line 3', () => {
    const page = getPage()
    page.radioLabelFromText('A prisoner in this establishment').click()
    page.simulateReturnFromPrisonerSearch(100, '1-1-1', '1-1-1-1', 'G5512G')
    page.continue().click()
    page.checkOffenceCode(1001, 'Yes')
  })
  it('line 4', () => {
    const page = getPage()
    page.radioLabelFromText('A prisoner in this establishment').click()
    page.simulateReturnFromPrisonerSearch(100, '1-1-1', '1-1-1-1', 'G5512G')
    page.continue().click()
    page.checkOffenceCode(1002, 'No')
  })
  it('line 5', () => {
    const page = getPage()
    page.radioLabelFromText('A prison officer').click()
    page.simulateReturnFromStaffSearch(100, '1-1-1', '1-1-1-2', 'AOWENS')
    page.continue().click()
    page.checkOffenceCode(1003, 'Yes')
  })
  it('line 6', () => {
    const page = getPage()
    page.radioLabelFromText('A prison officer').click()
    page.simulateReturnFromStaffSearch(100, '1-1-1', '1-1-1-2', 'AOWENS')
    page.continue().click()
    page.checkOffenceCode(1004, 'No')
  })
  it('line 7', () => {
    const page = getPage()
    page.radioLabelFromText('A member of staff who is not a prison officer').click()
    page.simulateReturnFromStaffSearch(100, '1-1-1', '1-1-1-3', 'CSTANLEY')
    page.continue().click()
    page.checkOffenceCode(1005, 'Yes')
  })
  it('line 8', () => {
    const page = getPage()
    page.radioLabelFromText('A member of staff who is not a prison officer').click()
    page.simulateReturnFromStaffSearch(100, '1-1-1', '1-1-1-3', 'CSTANLEY')
    page.continue().click()
    page.checkOffenceCode(1006, 'No')
  })
  it('line 9 - version 2', () => {
    const page = getPage()
    page.radioLabelFromText('A prisoner who’s left this establishment').click()
    page.victimPersonOutsideEstablishmentSearchNameInput().type('Another Person')
    page.victimPersonOutsideEstablishmentSearchNumberInput().type(prisonerOutsideEstablishmentNumber)
    page.continue().click()
    page.checkOffenceCode(1021, 'Yes')
  })
  it('line 10 - version 2', () => {
    const page = getPage()
    page.radioLabelFromText('A prisoner who’s left this establishment').click()
    page.victimPersonOutsideEstablishmentSearchNameInput().type('Another Person')
    page.victimPersonOutsideEstablishmentSearchNumberInput().type(prisonerOutsideEstablishmentNumber)
    page.continue().click()
    page.checkOffenceCode(1022, 'No')
  })
  it('line 9', () => {
    const page = getPage()
    page.radioLabelFromText('A person not listed above').click()
    page.victimOtherPersonSearchNameInput().type('Another Person')
    page.continue().click()
    page.checkOffenceCode(1007, 'Yes')
  })
  it('line 10', () => {
    const page = getPage()
    page.radioLabelFromText('A person not listed above').click()
    page.victimOtherPersonSearchNameInput().type('Another Person')
    page.continue().click()
    page.checkOffenceCode(1008, 'No')
  })
  it('line 11 - 4001', () => {
    const page = getPage('Fighting with someone')
    page.radioLabelFromText('A prisoner in this establishment').click()
    page.simulateReturnFromPrisonerSearch(100, '1-1-2', '1-1-2-1', 'G5512G')
    page.checkOffenceCode(4001, 'A prisoner in this establishment')
  })

  it('line 11 - 4002', () => {
    const page = getPage('Fighting with someone')
    page.radioLabelFromText('A prison officer').click()
    page.simulateReturnFromStaffSearch(100, '1-1-2', '1-1-2-2', 'AOWENS')
    page.checkOffenceCode(4002, 'A prison officer')
  })

  it('line 11 - 4003', () => {
    const page = getPage('Fighting with someone')
    page.radioLabelFromText('A member of staff who is not a prison officer').click()
    page.simulateReturnFromStaffSearch(100, '1-1-2', '1-1-2-3', 'AOWENS')
    page.checkOffenceCode(4003, 'A member of staff who is not a prison officer')
  })

  it('line 11 - 4004', () => {
    const page = getPage('Fighting with someone')
    page.radioLabelFromText('A prisoner who’s left this establishment').click()
    page.victimPersonOutsideEstablishmentSearchNumberInput().type(prisonerOutsideEstablishmentNumber)
    page.checkOffenceCode(4004, 'A prisoner who’s left this establishment')
  })

  it('line 11 - 4005', () => {
    const page = getPage('Fighting with someone')
    page.radioLabelFromText('A person not listed above').click()
    page.victimOtherPersonSearchNameInput().type(prisonerOutsideEstablishmentNumber)
    page.checkOffenceCode(4005, 'A person not listed above')
  })
  it('line 12 - 5001', () => {
    const page = getPage('Endangering the health or personal safety of someone')
    page.radioLabelFromText('A prisoner in this establishment').click()
    page.simulateReturnFromPrisonerSearch(100, '1-1-3', '1-1-3-1', 'G5512G')
    page.checkOffenceCode(5001, 'A prisoner in this establishment')
  })

  it('line 12 - 5002', () => {
    const page = getPage('Endangering the health or personal safety of someone')
    page.radioLabelFromText('A prison officer').click()
    page.simulateReturnFromStaffSearch(100, '1-1-3', '1-1-3-2', 'AOWENS')
    page.checkOffenceCode(5002, 'A prison officer')
  })

  it('line 12 - 5003', () => {
    const page = getPage('Endangering the health or personal safety of someone')
    page.radioLabelFromText('A member of staff who is not a prison officer').click()
    page.simulateReturnFromStaffSearch(100, '1-1-3', '1-1-3-3', 'AOWENS')
    page.checkOffenceCode(5003, 'A member of staff who is not a prison officer')
  })

  it('line 12 - 5004', () => {
    const page = getPage('Endangering the health or personal safety of someone')
    page.radioLabelFromText('A prisoner who’s left this establishment').click()
    page.victimPersonOutsideEstablishmentSearchNumberInput().type(prisonerOutsideEstablishmentNumber)
    page.checkOffenceCode(5004, 'A prisoner who’s left this establishment')
  })

  it('line 12 - 5005', () => {
    const page = getPage('Endangering the health or personal safety of someone')
    page.radioLabelFromText('A person not listed above').click()
    page.victimOtherPersonSearchNameInput().type(prisonerOutsideEstablishmentNumber)
    page.checkOffenceCode(5005, 'A person not listed above')
  })

  it('line 14', () => {
    checkSimpleDecisionPath(['Escape or failure to comply with temporary release conditions', 'Escaping'], 7001)
  })
  it('line 15', () => {
    checkSimpleDecisionPath(
      [
        'Escape or failure to comply with temporary release conditions',
        'Absconding from either prison or legal custody',
      ],
      7002
    )
  })
  it('line 16', () => {
    checkSimpleDecisionPath(
      [
        'Escape or failure to comply with temporary release conditions',
        'Failing to comply with any conditions of a temporary release',
      ],
      8001
    )
  })
  it('line 17', () => {
    checkSimpleDecisionPath(
      [
        'Escape or failure to comply with temporary release conditions',
        'Failing to return from their temporary release',
      ],
      8002
    )
  })
  it('line 19', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Possession of an unauthorised article',
        'Has an unauthorised article in their possession',
        'Yes',
      ],
      12001
    )
  })
  it('line 20', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Possession of an unauthorised article',
        'Has an unauthorised article in their possession',
        'No',
      ],
      12002
    )
  })
  it('line 21', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Possession of an unauthorised article',
        'Sells or gives an unauthorised article to another person',
        'Yes',
      ],
      14001
    )
  })
  it('line 22', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Possession of an unauthorised article',
        'Sells or gives an unauthorised article to another person',
        'No',
      ],
      13001
    )
  })
  it('line 23', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Possession of an unauthorised article',
        'Takes an article from another person without permission',
      ],
      15001
    )
  })
  it('line 24', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Drugs',
        'Receiving any controlled drug without the consent of an officer',
      ],
      24001
    )
  })
  it('line 25', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Drugs',
        'Receiving any controlled drug or any other article during a visit',
      ],
      24002
    )
  })
  it('line 26', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Drugs',
        'Tampering with or falsifying a drug testing sample',
      ],
      23001
    )
  })
  it('line 27', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Drugs',
        'Refuses to provide a sample for drug testing',
      ],
      23002
    )
  })
  it('line 28', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Drugs',
        'Administrating a controlled drug to themself',
      ],
      9001
    )
  })
  it('line 29', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Drugs',
        'Failing to stop someone else administrating a controlled drug to them',
      ],
      9002
    )
  })
  it('line 30', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Drugs',
        'Possessing any unauthorised controlled drugs',
      ],
      12101
    )
  })
  it('line 31', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Drugs',
        'Possessing a greater quantity of controlled drugs than authorised to have',
      ],
      12102
    )
  })
  it('line 32', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Alcohol',
        'Consumes any alcoholic drink',
      ],
      10001
    )
  })
  it('line 33', () => {
    checkSimpleDecisionPath(
      [
        'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)',
        'Alcohol',
        'Consumes any alcoholic drink other than that provided to them under rule 25(1)',
      ],
      11001
    )
  })
  it('line 35', () => {
    checkSimpleDecisionPath(
      ['Sets fire to, or damages, the prison or any property', 'Sets fire to any part of the prison or any property'],
      16001
    )
  })
  it('line 36 - 17001', () => {
    checkSimpleDecisionPath(
      [
        'Sets fire to, or damages, the prison or any property',
        'Destroys part of the prison or someone else’s property',
        'Yes',
      ],
      17001
    )
  })
  it('line 36 - 17002', () => {
    checkSimpleDecisionPath(
      [
        'Sets fire to, or damages, the prison or any property',
        'Destroys part of the prison or someone else’s property',
        'No',
      ],
      17002
    )
  })
  it('line 38 - 24101', () => {
    checkSimpleDecisionPath(
      ['Sets fire to, or damages, the prison or any property', 'Displays or draws abusive or racist images'],
      24101
    )
  })
  it('line 40', () => {
    checkSimpleDecisionPath(
      ['Disrespectful, threatening, abusive, or insulting behaviour', 'Disrespectful behaviour', 'A prison officer'],
      19001
    )
  })
  it('line 41', () => {
    checkSimpleDecisionPath(
      [
        'Disrespectful, threatening, abusive, or insulting behaviour',
        'Disrespectful behaviour',
        'A member of staff who is not a prison officer',
      ],
      19002
    )
  })
  it('line 42', () => {
    checkSimpleDecisionPath(
      [
        'Disrespectful, threatening, abusive, or insulting behaviour',
        'Disrespectful behaviour',
        'Another person not listed above',
      ],
      19003
    )
  })
  it('line 43', () => {
    checkSimpleDecisionPath(
      [
        'Disrespectful, threatening, abusive, or insulting behaviour',
        'Threatening, abusive, or insulting behaviour',
        'Yes',
      ],
      20001
    )
  })
  it('line 44', () => {
    checkSimpleDecisionPath(
      [
        'Disrespectful, threatening, abusive, or insulting behaviour',
        'Threatening, abusive, or insulting behaviour',
        'No',
      ],
      20002
    )
  })
  it('line 46', () => {
    checkSimpleDecisionPath(
      ['Disobeys any lawful order, or failure to comply with any rule or regulation', 'Disobeying any lawful order'],
      22001
    )
  })
  it('line 47', () => {
    checkSimpleDecisionPath(
      [
        'Disobeys any lawful order, or failure to comply with any rule or regulation',
        'Failure to comply with any rule or regulation',
      ],
      23101
    )
  })
  it('line 49', () => {
    checkSimpleDecisionPath(['Detains another person', 'A prisoner in this establishment'], 2001)
  })
  it('line 50', () => {
    checkSimpleDecisionPath(['Detains another person', 'A prison officer'], 2002)
  })
  it('line 51', () => {
    checkSimpleDecisionPath(['Detains another person', 'A member of staff who is not a prison officer'], 2003)
  })
  it('line 52 - version 2', () => {
    checkSimpleDecisionPath(['Detains another person', 'A prisoner who’s left this establishment'], 2021)
  })
  it('line 52', () => {
    checkSimpleDecisionPath(['Detains another person', 'A person not listed above'], 2004)
  })
  it('line 54', () => {
    checkSimpleDecisionPath(
      [
        'Stopping someone who is not a prisoner from doing their job',
        'Denying someone access to any part of the prison',
      ],
      3001
    )
  })
  it('line 55', () => {
    checkSimpleDecisionPath(
      [
        'Stopping someone who is not a prisoner from doing their job',
        'Obstructing a member of staff from doing their job',
      ],
      6001
    )
  })
  it('line 56 ', () => {
    checkSimpleDecisionPath(
      [
        'Stopping someone who is not a prisoner from doing their job',
        'Stopping someone carrying out a drug test',
        'Tampering with or falsifying a drug testing sample',
      ],
      23201
    )
  })
  it('line 57', () => {
    checkSimpleDecisionPath(
      [
        'Stopping someone who is not a prisoner from doing their job',
        'Stopping someone carrying out a drug test',
        'Refuses to provide a sample for drug testing',
      ],
      23202
    )
  })
  it('line 59', () => {
    checkSimpleDecisionPath(
      [
        'Being absent without authorisation, being in an unauthorised place, or failing to work correctly',
        'Being absent without authorisation',
      ],
      18001
    )
  })
  it('line 60', () => {
    checkSimpleDecisionPath(
      [
        'Being absent without authorisation, being in an unauthorised place, or failing to work correctly',
        'Being in an unauthorised place',
      ],
      18002
    )
  })
  it('line 61', () => {
    checkSimpleDecisionPath(
      [
        'Being absent without authorisation, being in an unauthorised place, or failing to work correctly',
        'Failing to work correctly',
      ],
      21001
    )
  })
})

const getPage = (option = 'Assaulting someone'): OffenceCodeSelection => {
  cy.visit(adjudicationUrls.offenceCodeSelection.urls.start(100, 'committed'))
  const page = new OffenceCodeSelection('What type of offence did John Smith commit?')
  page.radioLabelFromText('Assault, fighting, or endangering the health or personal safety of others').click()
  page.continue().click()
  page.radioLabelFromText(option).click()
  page.continue().click()
  return page
}

const checkSimpleDecisionPath = (labels: string[], endOffenceCode: number) => {
  cy.visit(adjudicationUrls.offenceCodeSelection.urls.start(100, 'committed'))
  const page = new OffenceCodeSelection('What type of offence did John Smith commit?')
  labels.forEach((label, index) => {
    if (labels.length - 1 === index) {
      page.checkOffenceCode(endOffenceCode, label)
    } else {
      page.radioLabelFromText(label).click()
      page.continue().click()
    }
  })
}
