import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import { decision, DecisionType as Type } from '../../offenceCodeDecisions/Decision'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { answer } from '../../offenceCodeDecisions/Answer'
import OffenceSessionService from '../../services/offenceSessionService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/decisionTreeService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const decisionTreeService = new DecisionTreeService() as jest.Mocked<DecisionTreeService>

const testDecisionsTree = decision([
  [Role.COMMITTED, `Committed: ${Text.PRISONER_FULL_NAME}`],
  [Role.ATTEMPTED, `Attempted: ${Text.PRISONER_FULL_NAME}`],
  [Role.ASSISTED, `Assisted: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
  [Role.INCITED, `Incited: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
])
  .child(answer('Another prisoner answer').type(Type.PRISONER).offenceCode(1))
  .child(answer('A prison officer answer').type(Type.OFFICER).offenceCode(2))
  .child(answer('A member of staff answer').type(Type.STAFF).offenceCode(3))
  .child(answer('Another person answer').type(Type.OTHER_PERSON).offenceCode(4))
  .child(answer('A standard answer').offenceCode(5))
  .child(
    answer('A standard answer with child question').child(
      decision('A child question').child(answer('A standard child answer').offenceCode(6))
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
        expect(res.text).toContain('Another prisoner answer')
        expect(res.text).toContain('A member of staff answer')
        expect(res.text).toContain('Another person answer')
        expect(res.text).toContain('A standard answer')
        expect(res.text).toContain('A standard answer with child question')
      })
  })
})

describe('POST /offence-code-selection/100/assisted/1', () => {
  it('should redirect to the next page when selecting a standard answer with a child', () => {
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({ selectedAnswerId: '1-6' })
      .expect(302)
      .expect('Location', '/offence-code-selection/100/assisted/1-6')
  })
})

describe('POST /offence-code-selection/100/assisted/1', () => {
  it('should redirect to the next page when selecting a standard answer with a child', () => {
    return request(app)
      .post('/offence-code-selection/100/assisted/1')
      .send({
        selectedAnswerId: testDecisionsTree.matchingAnswersByText('A standard answer with child question')[0].id(),
      })
      .expect(302)
      .expect('Location', '/offence-code-selection/100/assisted/1-6')
  })
})
