import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import { Decision, decision, DecisionType as Type } from '../../offenceCodeDecisions/Decision'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { Answer, answer } from '../../offenceCodeDecisions/Answer'
import OffenceSessionService from '../../services/offenceSessionService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/decisionTreeService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const decisionTreeService = new DecisionTreeService() as jest.Mocked<DecisionTreeService>

const aPrisonerAnswerText = 'Another prisoner answer'
const aPrisonOfficerAnswerText = 'A prison officer answer'
const aMemberOfStaffAnswerText = 'A member of staff answer'
const anotherPersonAnswerText = 'Another person answer'
const aStandardAnswerText = 'A standard answer'
const aStandardAnswerWithChildQuestionText = 'A standard answer with child question'
const aStandardChildAnswer = 'A standard child answer'

const testDecisionsTree = decision([
  [Role.COMMITTED, `Committed: ${Text.PRISONER_FULL_NAME}`],
  [Role.ATTEMPTED, `Attempted: ${Text.PRISONER_FULL_NAME}`],
  [Role.ASSISTED, `Assisted: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
  [Role.INCITED, `Incited: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
])
  .child(answer(aPrisonerAnswerText).type(Type.PRISONER).offenceCode(1))
  .child(answer(aPrisonOfficerAnswerText).type(Type.OFFICER).offenceCode(2))
  .child(answer(aMemberOfStaffAnswerText).type(Type.STAFF).offenceCode(3))
  .child(answer(anotherPersonAnswerText).type(Type.OTHER_PERSON).offenceCode(4))
  .child(answer(aStandardAnswerText).offenceCode(5))
  .child(
    answer(aStandardAnswerWithChildQuestionText).child(
      decision('A child question').child(answer(aStandardChildAnswer).offenceCode(6))
    )
  )

let app: Express

beforeEach(() => {
  decisionTreeService.getDecisionTree.mockReturnValue(testDecisionsTree)

  placeOnReportService.getOffencePrisonerDetails.mockResolvedValue({
    prisoner: {
      offenderNo: undefined,
      firstName: 'TOM',
      lastName: 'SAMUELS',
      categoryCode: undefined,
      language: undefined,
      friendlyName: undefined,
      displayName: undefined,
      prisonerNumber: undefined,
      currentLocation: undefined,
      assignedLivingUnit: undefined,
    },
    associatedPrisoner: {
      offenderNo: undefined,
      firstName: 'ALESSANDRO',
      lastName: 'SWAN',
      categoryCode: undefined,
      language: undefined,
      friendlyName: undefined,
      displayName: undefined,
      prisonerNumber: undefined,
      currentLocation: undefined,
      assignedLivingUnit: undefined,
    },
  })
  const offenceSessionService = new OffenceSessionService()
  app = appWithAllRoutes({ production: false }, { placeOnReportService, decisionTreeService, offenceSessionService })
})

function findAnswerByText(rootDecision: Decision, text: string): Answer {
  return rootDecision.findAnswerBy(a => a.getText() === text)
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /offence-code-selection/100/assisted/1', () => {
  it('should load the first page of the offence code select pages', () => {
    return request(app)
      .get('/offence-code-selection/100/assisted/1')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Assisted: Tom Samuels. Associated: Alessandro Swan')
        expect(res.text).toContain(aPrisonerAnswerText)
        expect(res.text).toContain(aPrisonOfficerAnswerText)
        expect(res.text).toContain(aMemberOfStaffAnswerText)
        expect(res.text).toContain(anotherPersonAnswerText)
        expect(res.text).toContain(aStandardAnswerText)
        expect(res.text).toContain(aStandardAnswerWithChildQuestionText)
      })
  })
})

describe('POST /offence-code-selection/100/assisted/1 VALIDATION', () => {
  it('should validate on submit when no answer is selected', () => {
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .expect(res => {
        expect(res.text).toContain('Please make a choice')
      })
  })

  it(`should validate a ${Type.OTHER_PERSON} answer when no name is added`, () => {
    const anotherPersonAnswer = findAnswerByText(testDecisionsTree, anotherPersonAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: anotherPersonAnswer.id(),
      })
      .expect(res => {
        expect(res.text).toContain('You must enter a name')
      })
  })

  it(`should validate a ${Type.PRISONER} answer when no prisoner id is present`, () => {
    const aPrisonerAnswer = findAnswerByText(testDecisionsTree, aPrisonerAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aPrisonerAnswer.id(),
        prisonerSearchNameInput: 'FirstName LastName',
      })
      .expect(res => {
        expect(res.text).toContain('Search for a prisoner')
      })
  })

  it(`should validate a ${Type.PRISONER} answer when searching and no search text`, () => {
    const aPrisonerAnswer = findAnswerByText(testDecisionsTree, aPrisonerAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aPrisonerAnswer.id(),
        searchUser: 'searchUser',
      })
      .expect(res => {
        expect(res.text).toContain('Enter their name or prison number')
      })
  })

  it(`should validate a ${Type.OFFICER} question when no staff id is present and not searching`, () => {
    const aPrisonOfficerAnswer = findAnswerByText(testDecisionsTree, aPrisonOfficerAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aPrisonOfficerAnswer.id(),
      })
      .expect(res => {
        expect(res.text).toContain('Search for a prison officer')
      })
  })

  it(`should validate a ${Type.OFFICER} question when searching and no search text`, () => {
    const aPrisonOfficerAnswer = findAnswerByText(testDecisionsTree, aPrisonOfficerAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aPrisonOfficerAnswer.id(),
        searchUser: 'searchUser',
      })
      .expect(res => {
        expect(res.text).toContain('Enter their first name')
        expect(res.text).toContain('Enter their last name')
      })
  })

  it(`should validate a ${Type.STAFF} question when no staff id is present and not searching`, () => {
    const aMemberOfStaffAnswer = findAnswerByText(testDecisionsTree, aMemberOfStaffAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aMemberOfStaffAnswer.id(),
      })
      .expect(res => {
        expect(res.text).toContain('Search for a member of staff')
      })
  })

  it(`should validate a ${Type.STAFF} question when searching and no search text`, () => {
    const aMemberOfStaffAnswer = findAnswerByText(testDecisionsTree, aMemberOfStaffAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aMemberOfStaffAnswer.id(),
        searchUser: 'searchUser',
      })
      .expect(res => {
        expect(res.text).toContain('Enter their first name')
        expect(res.text).toContain('Enter their last name')
      })
  })
})

describe('POST /offence-code-selection/100/assisted/1 REDIRECTION', () => {
  it('should redirect to the detail of offence page when selecting a standard answer with a offenceCode', () => {
    const aStandardAnswer = findAnswerByText(testDecisionsTree, aStandardAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aStandardAnswer.id(),
      })
      .expect(302)
      .expect(
        'Location',
        `/details-of-offence/100/add?victimOtherPersonsName=&victimPrisonersNumber=&victimStaffUsername=&offenceCode=${aStandardAnswer.getOffenceCode()}`
      )
  })

  it('should redirect to the next page when selecting a standard answer with a child', () => {
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: findAnswerByText(testDecisionsTree, aStandardAnswerWithChildQuestionText).id(),
      })
      .expect(302)
      .expect('Location', '/offence-code-selection/100/assisted/1-6')
  })

  it(`A ${Type.PRISONER} answer should redirect to search when searching`, () => {
    const aPrisonerAnswer = findAnswerByText(testDecisionsTree, aPrisonerAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aPrisonerAnswer.id(),
        searchUser: 'searchUser',
        prisonerSearchNameInput: 'FirstName LastName',
      })
      .expect(302)
      .expect('Location', `/select-associated-prisoner?searchTerm=FirstName%20LastName`)
  })

  it(`A ${Type.OFFICER} answer should redirect to search when searching`, () => {
    const aPrisonOfficerAnswer = findAnswerByText(testDecisionsTree, aPrisonOfficerAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aPrisonOfficerAnswer.id(),
        searchUser: 'searchUser',
        officerSearchFirstNameInput: 'FirstName',
        officerSearchLastNameInput: 'LastName',
      })
      .expect(302)
      .expect('Location', `/select-associated-staff?staffFirstName=FirstName&staffLastName=LastName`)
  })

  it(`A ${Type.STAFF} answer should redirect to search when searching`, () => {
    const aMemberOfStaffAnswer = findAnswerByText(testDecisionsTree, aMemberOfStaffAnswerText)
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: aMemberOfStaffAnswer.id(),
        searchUser: 'searchUser',
        staffSearchFirstNameInput: 'FirstName',
        staffSearchLastNameInput: 'LastName',
      })
      .expect(302)
      .expect('Location', `/select-associated-staff?staffFirstName=FirstName&staffLastName=LastName`)
  })
})
