import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { AnswerType as Type } from '../../offenceCodeDecisions/Answer'
import UserService from '../../services/userService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { answer, question } from '../../offenceCodeDecisions/Decisions'
import PrisonerSearchService from '../../services/prisonerSearchService'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/reportedAdjudicationsService')
jest.mock('../../services/prisonerSearchService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const prisonerSearchService = new PrisonerSearchService(null) as jest.Mocked<PrisonerSearchService>

const aPrisonerAnswerText = 'Another prisoner answer'
const aPrisonerAnswer = answer(aPrisonerAnswerText)
const aPrisonerOutsideEstablishmentAnswerText = 'Another prisoner answer'
const aPrisonerOutsideEstablishmentAnswer = answer(aPrisonerOutsideEstablishmentAnswerText)
const aPrisonOfficerAnswerText = 'A prison officer answer'
const aPrisonOfficerAnswer = answer(aPrisonOfficerAnswerText)
const aMemberOfStaffAnswerText = 'A member of staff answer'
const aMemberOfStaffAnswer = answer(aMemberOfStaffAnswerText)
const anotherPersonAnswerText = 'Another person answer'
const anotherPersonAnswer = answer(anotherPersonAnswerText)
const aStandardAnswerText = 'A standard answer'
const aStandardAnswer = answer(aStandardAnswerText)
const aStandardAnswerWithChildQuestionText = 'A standard answer with child question'
const aStandardAnswerWithChildQuestion = answer(aStandardAnswerWithChildQuestionText)
const aStandardChildAnswerText = 'A standard child answer'
const aStandardChildAnswer = answer(aStandardChildAnswerText)

const testDecisionsTree = question([
  [Role.COMMITTED, `Committed: ${Text.PRISONER_FULL_NAME}`],
  [Role.ATTEMPTED, `Attempted: ${Text.PRISONER_FULL_NAME}`],
  [Role.ASSISTED, `Assisted: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
  [Role.INCITED, `Incited: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
])
  .child(aPrisonerAnswer.type(Type.PRISONER).offenceCode(1))
  .child(aPrisonOfficerAnswer.type(Type.OFFICER).offenceCode(2))
  .child(aMemberOfStaffAnswer.type(Type.STAFF).offenceCode(3))
  .child(anotherPersonAnswer.type(Type.OTHER_PERSON).offenceCode(4))
  .child(aStandardAnswer.offenceCode(5))
  .child(
    aStandardAnswerWithChildQuestion.child(question('A child question').child(aStandardChildAnswer.offenceCode(6)))
  )
  .child(aPrisonerOutsideEstablishmentAnswer.type(Type.PRISONER_OUTSIDE_ESTABLISHMENT).offenceCode(11))

const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  testDecisionsTree
)
let app: Express

beforeEach(() => {
  userService.getStaffFromUsername.mockResolvedValue(testData.staffFromUsername())

  placeOnReportService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: undefined,
      firstName: 'A_PRISONER_FIRST_NAME',
      lastName: 'A_PRISONER_LAST_NAME',
    })
  )

  placeOnReportService.getOffencePrisonerDetails.mockResolvedValue({
    prisoner: testData.prisonerResultSummary({
      offenderNo: undefined,
      firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
      lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
    }),
    associatedPrisoner: testData.prisonerResultSummary({
      offenderNo: undefined,
      firstName: 'ADJUDICATION_ASSOCIATED_PRISONER_FIRST_NAME',
      lastName: 'ADJUDICATION_ASSOCIATED_PRISONER_LAST_NAME',
    }),
  })

  prisonerSearchService.isPrisonerNumberValid.mockResolvedValue(true)

  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, decisionTreeService, userService, prisonerSearchService }
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /offence-code-selection/100/assisted/1 view', () => {
  it('should load the first page of the offence code select pages', () => {
    return request(app)
      .get(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(
          'Assisted: Adjudication_prisoner_first_name Adjudication_prisoner_last_name. Associated: Adjudication_associated_prisoner_first_name Adjudication_associated_prisoner_last_name'
        )
        expect(res.text).toContain(aPrisonerAnswerText)
        expect(res.text).toContain(aPrisonOfficerAnswerText)
        expect(res.text).toContain(aMemberOfStaffAnswerText)
        expect(res.text).toContain(anotherPersonAnswerText)
        expect(res.text).toContain(aStandardAnswerText)
        expect(res.text).toContain(aStandardAnswerWithChildQuestionText)
      })
  })
})

describe('POST /offence-code-selection/100/assisted/1 validation', () => {
  it('should validate on submit when no answer is selected', () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .expect(res => {
        expect(res.text).toContain('Select an option')
      })
  })

  it(`should validate a ${Type.OTHER_PERSON} answer when no name is added`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: anotherPersonAnswer.id(),
      })
      .expect(res => {
        expect(res.text).toContain('Enter the person’s name')
      })
  })

  it(`should validate a ${Type.PRISONER} answer when no prisoner id is present`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonerAnswer.id(),
        prisonerSearchNameInput: 'FirstName LastName',
      })
      .expect(res => {
        expect(res.text).toContain('Search for a prisoner')
      })
  })

  it(`should validate a ${Type.PRISONER} answer when searching and no search text`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonerAnswer.id(),
        searchUser: 'searchUser',
      })
      .expect(res => {
        expect(res.text).toContain('Enter their name or prison number')
      })
  })

  it(`should validate a ${Type.PRISONER_OUTSIDE_ESTABLISHMENT} answer when no name or number is added`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonerOutsideEstablishmentAnswer.id(),
      })
      .expect(res => {
        expect(res.text).toContain('Enter the prisoner’s name')
        expect(res.text).toContain('Enter their prison number')
      })
  })

  it(`should validate a ${Type.PRISONER_OUTSIDE_ESTABLISHMENT} answer when the size of the number exceeds that supported in the DB`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonerOutsideEstablishmentAnswer.id(),
        prisonerOutsideEstablishmentNameInput: 'A Name',
        prisonerOutsideEstablishmentNumberInput: 'AVERYLONGNUMBER',
      })
      .expect(res => {
        expect(res.text).toContain('The prison number must not exceed 7 characters')
      })
  })

  it(`should validate a ${Type.PRISONER_OUTSIDE_ESTABLISHMENT} answer when the number does not correlate with a known prisoner`, () => {
    prisonerSearchService.isPrisonerNumberValid.mockResolvedValue(false)
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonerOutsideEstablishmentAnswer.id(),
        prisonerOutsideEstablishmentNameInput: 'A Name',
        prisonerOutsideEstablishmentNumberInput: 'A1234AA',
      })
      .expect(res => {
        expect(res.text).toContain('The prison number you have entered does not match a prisoner')
      })
  })

  it(`should validate a ${Type.OFFICER} question when no staff id is present and not searching`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonOfficerAnswer.id(),
      })
      .expect(res => {
        expect(res.text).toContain('Enter the person’s name')
      })
  })

  it(`should validate a ${Type.OFFICER} question when searching and no search text`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonOfficerAnswer.id(),
        searchUser: 'searchUser',
      })
      .expect(res => {
        expect(res.text).toContain('Enter the person’s name')
      })
  })

  it(`should validate a ${Type.STAFF} question when no staff id is present and not searching`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aMemberOfStaffAnswer.id(),
      })
      .expect(res => {
        expect(res.text).toContain('Enter the person’s name')
      })
  })

  it(`should validate a ${Type.STAFF} question when searching and no search text`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aMemberOfStaffAnswer.id(),
        searchUser: 'searchUser',
      })
      .expect(res => {
        expect(res.text).toContain('Enter the person’s name')
      })
  })
})

describe('POST /offence-code-selection/100/assisted/1 searching outgoing', () => {
  it(`A ${Type.PRISONER} answer should redirect to search when searching`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonerAnswer.id(),
        searchUser: 'searchUser',
        prisonerSearchNameInput: 'FirstName LastName',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=FirstName%20LastName`)
  })

  it(`A ${Type.OFFICER} answer should redirect to search when searching`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonOfficerAnswer.id(),
        searchUser: 'searchUser',
        officerSearchNameInput: 'FirstName LastName',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=FirstName%20LastName`)
  })

  it(`A ${Type.STAFF} answer should redirect to search when searching`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aMemberOfStaffAnswer.id(),
        searchUser: 'searchUser',
        staffSearchNameInput: 'FirstName LastName',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.selectAssociatedStaff.root}?staffName=FirstName%20LastName`)
  })

  it(`A ${Type.PRISONER_OUTSIDE_ESTABLISHMENT} answer should redirect to add offence`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonerOutsideEstablishmentAnswer.id(),
        prisonerOutsideEstablishmentNameInput: 'A Name',
        prisonerOutsideEstablishmentNumberInput: 'A1234AA',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.detailsOfOffence.root}/100/add?victimOtherPersonsName=A%20Name&victimPrisonersNumber=A1234AA&victimStaffUsername=&offenceCode=11`
      )
  })
})

describe('GET /offence-code-selection/100/assisted/1 searching incoming', () => {
  it(`A ${Type.PRISONER} answer should should be selected and have the prison number hidden input when returning from search`, () => {
    return request(app)
      .get(
        `${adjudicationUrls.offenceCodeSelection.urls.question(
          100,
          'assisted',
          '1'
        )}?selectedAnswerId=${aPrisonerAnswer.id()}&selectedPerson=PRISONER_ID`
      )
      .expect(res => {
        expect(res.text).toContain(`value="${aPrisonerAnswer.id()}" checked`)
        expect(res.text).toContain('name="prisonerId" value="PRISONER_ID"')
      })
  })

  it(`A ${Type.OFFICER} answer should should be selected and have the staff username hidden input when returning from search`, () => {
    return request(app)
      .get(
        `${adjudicationUrls.offenceCodeSelection.urls.question(
          100,
          'assisted',
          '1'
        )}?selectedAnswerId=${aPrisonOfficerAnswer.id()}&selectedPerson=STAFF_USERNAME`
      )
      .expect(res => {
        expect(res.text).toContain(`value="${aPrisonOfficerAnswer.id()}" checked`)
        expect(res.text).toContain('name="officerId" value="STAFF_USERNAME"')
      })
  })

  it(`A ${Type.STAFF} answer should should be selected and have the staff username hidden input when returning from search`, () => {
    return request(app)
      .get(
        `${adjudicationUrls.offenceCodeSelection.urls.question(
          100,
          'assisted',
          '1'
        )}?selectedAnswerId=${aMemberOfStaffAnswer.id()}&selectedPerson=STAFF_USERNAME`
      )
      .expect(res => {
        expect(res.text).toContain(`value="${aMemberOfStaffAnswer.id()}" checked`)
        expect(res.text).toContain('name="staffId" value="STAFF_USERNAME"')
      })
  })
})

describe('POST /offence-code-selection/100/assisted/1 next page', () => {
  it('should redirect to the next page when selecting a standard answer with a child', () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aStandardAnswerWithChildQuestion.id(),
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.offenceCodeSelection.urls.question(
          100,
          'assisted',
          '1-6'
        )}?victimOtherPersonsName=&victimPrisonersNumber=&victimStaffUsername=&offenceCode=undefined`
      )
  })
})

describe('POST /offence-code-selection/100/assisted/1 finishing', () => {
  it('An end standard answer should redirect to the detail of offence page with an offence code added to the output', () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aStandardAnswer.id(),
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.detailsOfOffence.urls.add(
          100
        )}?victimOtherPersonsName=&victimPrisonersNumber=&victimStaffUsername=&offenceCode=${aStandardAnswer.getOffenceCode()}`
      )
  })

  it(`An end ${Type.OFFICER} answer should redirect to the detail of offence page with a victimStaffUsername and offence code added to the output`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aPrisonOfficerAnswer.id(),
        officerId: 'USERNAME',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.detailsOfOffence.urls.add(
          100
        )}?victimOtherPersonsName=&victimPrisonersNumber=&victimStaffUsername=USERNAME&offenceCode=${aPrisonOfficerAnswer.getOffenceCode()}`
      )
  })

  it(`An end ${Type.STAFF} answer should redirect to the detail of offence page with a victimStaffUsername and offence code added to the output`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: aMemberOfStaffAnswer.id(),
        staffId: 'USERNAME',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.detailsOfOffence.urls.add(
          100
        )}?victimOtherPersonsName=&victimPrisonersNumber=&victimStaffUsername=USERNAME&offenceCode=${aMemberOfStaffAnswer.getOffenceCode()}`
      )
  })

  it(`An end ${Type.OTHER_PERSON} answer should redirect to the detail of offence page with a victimStaffUsername and offence code added to the output`, () => {
    return request(app)
      .post(`${adjudicationUrls.offenceCodeSelection.urls.question(100, 'assisted', '1')}`)
      .send({
        selectedAnswerId: anotherPersonAnswer.id(),
        otherPersonNameInput: 'FIRSTNAME LASTNAME',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.detailsOfOffence.urls.add(
          100
        )}?victimOtherPersonsName=FIRSTNAME%20LASTNAME&victimPrisonersNumber=&victimStaffUsername=&offenceCode=${anotherPersonAnswer.getOffenceCode()}`
      )
  })
})
