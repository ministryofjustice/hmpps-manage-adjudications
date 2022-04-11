import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import { decision } from '../../offenceCodeDecisions/Decision'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { AnswerType as Type, answer } from '../../offenceCodeDecisions/Answer'
import UserService from '../../services/userService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

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

const adjudicationPrisonerDetails: PrisonerResultSummary = {
  offenderNo: 'G6415GD',
  prisonerNumber: 'G6415GD',
  firstName: 'ADJUDICATION_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_PRISONER_LAST_NAME',
  categoryCode: undefined,
  language: undefined,
  friendlyName: undefined,
  displayName: undefined,
  currentLocation: undefined,
  assignedLivingUnit: undefined,
}

const adjudicationAssociatedPrisonerDetails: PrisonerResultSummary = {
  offenderNo: 'G7824GD',
  prisonerNumber: 'G7824GD',
  firstName: 'ADJUDICATION_ASSOCIATED_PRISONER_FIRST_NAME',
  lastName: 'ADJUDICATION_ASSOCIATED_PRISONER_LAST_NAME',
  categoryCode: undefined,
  language: undefined,
  friendlyName: undefined,
  displayName: undefined,
  currentLocation: undefined,
  assignedLivingUnit: undefined,
}

const victimPrisonerDetails: PrisonerResultSummary = {
  offenderNo: 'G5512G',
  prisonerNumber: 'G5512G',
  firstName: 'A_PRISONER_FIRST_NAME',
  lastName: 'A_PRISONER_LAST_NAME',
  categoryCode: undefined,
  language: undefined,
  friendlyName: undefined,
  displayName: undefined,
  currentLocation: undefined,
  assignedLivingUnit: undefined,
}

const adjudicationWithOffences = {
  draftAdjudication: {
    id: 100,
    adjudicationNumber: 1524493,
    prisonerNumber: adjudicationPrisonerDetails.offenderNo,
    incidentDetails: {
      locationId: 197682,
      dateTimeOfIncident: '2021-12-09T10:30:00',
      handoverDeadline: '2021-12-11T10:30:00',
    },
    incidentRole: {
      roleCode: '25c',
      associatedPrisonersNumber: adjudicationAssociatedPrisonerDetails.offenderNo,
    },
    offenceDetails: [
      {
        offenceCode: 1,
        victimPrisonersNumber: victimPrisonerDetails.offenderNo,
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
    prisonerNumber: adjudicationPrisonerDetails.prisonerNumber,
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
    switch (adjudicationId) {
      case adjudicationWithOffences.draftAdjudication.id:
        return Promise.resolve(adjudicationWithOffences)
      case adjudicationWithoutOffences.draftAdjudication.id:
        return Promise.resolve(adjudicationWithoutOffences)
      default:
        return Promise.resolve(null)
    }
  })

  placeOnReportService.getPrisonerDetails.mockImplementation(prisonerNumber => {
    switch (prisonerNumber) {
      case adjudicationPrisonerDetails.prisonerNumber:
        return Promise.resolve(adjudicationPrisonerDetails)
      case adjudicationAssociatedPrisonerDetails.prisonerNumber:
        return Promise.resolve(adjudicationAssociatedPrisonerDetails)
      case victimPrisonerDetails.prisonerNumber:
        return Promise.resolve(victimPrisonerDetails)
      default:
        return Promise.resolve(null)
    }
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

describe('GET /details-of-offence/100 view', () => {
  it('should load the offence details page', () => {
    return request(app)
      .get(adjudicationUrls.detailsOfOffence.urls.start(100))
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
      .get(adjudicationUrls.detailsOfOffence.urls.start(100))
      .expect(200)
      .then(() =>
        agent
          .post(adjudicationUrls.detailsOfOffence.urls.start(100))
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
