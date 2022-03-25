import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import { decision } from '../../offenceCodeDecisions/Decision'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { AnswerType as Type, answer } from '../../offenceCodeDecisions/Answer'
import UserService from '../../services/userService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/reportedAdjudicationsService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

const testDecisionsTree = decision([
  [Role.COMMITTED, `Committed: ${Text.PRISONER_FULL_NAME}`],
  [Role.ATTEMPTED, `Attempted: ${Text.PRISONER_FULL_NAME}`],
  [Role.ASSISTED, `Assisted: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
  [Role.INCITED, `Incited: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
])
  .child(
    answer(['Prisoner victim', `Prisoner victim: ${Text.VICTIM_PRISONER_FULL_NAME}`])
      .type(Type.PRISONER)
      .offenceCode(1)
  )
  .child(
    answer('A standard answer with child question').child(
      decision('A child question').child(answer('A standard child answer').offenceCode(2))
    )
  )

const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  testDecisionsTree
)

let app: Express

const adjudicationWithOffences = {
  draftAdjudication: {
    id: 100,
    adjudicationNumber: 1524493,
    prisonerNumber: 'G6415GD',
    incidentDetails: {
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      handoverDeadline: '2021-12-11T10:30:00',
    },
    incidentRole: {
      roleCode: '25c',
    },
    offenceDetails: [
      {
        offenceCode: 1,
        victimPrisonersNumber: 'G5512G',
      },
      {
        offenceCode: 2,
      },
    ],
    startedByUserId: 'TEST_GEN',
  },
}

const adjudicationWithoutOffences = {
  draftAdjudication: {
    id: 101,
    adjudicationNumber: 1524493,
    prisonerNumber: 'G6415GD',
    incidentDetails: {
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      handoverDeadline: '2021-12-11T10:30:00',
    },
    incidentRole: {
      roleCode: '25c',
    },
    startedByUserId: 'TEST_GEN',
  },
}

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockImplementation(adjudicationId => {
    if (adjudicationWithOffences.draftAdjudication.id === adjudicationId) {
      return Promise.resolve(adjudicationWithOffences)
    }
    if (adjudicationWithoutOffences.draftAdjudication.id === adjudicationId) {
      return Promise.resolve(adjudicationWithoutOffences)
    }
    return Promise.resolve(null)
  })

  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: undefined,
    firstName: 'A_PRISONER_FIRST_NAME',
    lastName: 'A_PRISONER_LAST_NAME',
    categoryCode: undefined,
    language: undefined,
    friendlyName: undefined,
    displayName: undefined,
    prisonerNumber: undefined,
    currentLocation: undefined,
    assignedLivingUnit: undefined,
  })

  placeOnReportService.getOffencePrisonerDetails.mockResolvedValue({
    prisoner: {
      offenderNo: undefined,
      firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
      lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
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
      firstName: 'ADJUDICATION_ASSOCIATED_PRISONER_FIRST_NAME',
      lastName: 'ADJUDICATION_ASSOCIATED_PRISONER_LAST_NAME',
      categoryCode: undefined,
      language: undefined,
      friendlyName: undefined,
      displayName: undefined,
      prisonerNumber: undefined,
      currentLocation: undefined,
      assignedLivingUnit: undefined,
    },
  })

  placeOnReportService.getPrisonerNumberFromDraftAdjudicationNumber.mockResolvedValue('G6415GD')

  const allOffencesSessionService = new AllOffencesSessionService()
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, decisionTreeService, allOffencesSessionService, userService }
  )
})

afterEach(() => {
  jest.resetAllMocks()
})
// TODO reinstate with better expectations
describe('GET /details-of-offence/100 view', () => {
  it.skip('should load the offence details page', () => {
    return request(app)
      .get('/details-of-offence/100/')
      .expect('Content-Type', /html/)
      .expect(res => {
        // Title
        expect(res.text).toContain('Offence details')
        // First offence - first question and answer
        expect(res.text).toContain(
          'Assisted: Adjudication_prisoner_first_name Adjudication_prisoner_last_name. Associated: Adjudication_associated_prisoner_first_name Adjudication_associated_prisoner_last_name'
        )
        expect(res.text).toContain('Prisoner victim: A_prisoner_first_name A_prisoner_last_name')
        // Second offence - first question and answer
        expect(res.text).toContain(
          'Assisted: Adjudication_prisoner_first_name Adjudication_prisoner_last_name. Associated: Adjudication_associated_prisoner_first_name Adjudication_associated_prisoner_last_name'
        )
        expect(res.text).toContain('A standard answer with child question')
        // Second offence - second question and answer
        expect(res.text).toContain('A child question')
        expect(res.text).toContain('A standard child answer')
      })
  })
})

describe('POST /details-of-offence/100', () => {
  it('should save the offence', async () => {
    const agent = request.agent(app)
    return agent
      .get('/details-of-offence/100/')
      .expect(200)
      .then(() =>
        agent
          .post('/details-of-offence/100/')
          .expect(302)
          .then(() =>
            expect(placeOnReportService.saveOffenceDetails).toHaveBeenCalledWith(
              100,
              [{ offenceCode: 1, victimPrisonersNumber: 'G5512G' }, { offenceCode: 2 }],
              expect.anything()
            )
          )
      )
  })
})
