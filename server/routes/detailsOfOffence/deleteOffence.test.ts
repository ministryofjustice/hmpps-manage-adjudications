import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { AnswerType as Type } from '../../offenceCodeDecisions/Answer'
import UserService from '../../services/userService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { answer, question } from '../../offenceCodeDecisions/Decisions'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/reportedAdjudicationsService')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

const testDecisionsTree = question([
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
      question('A child question').child(answer('A standard child answer').offenceCode(2))
    )
  )
const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  testDecisionsTree
)
let app: Express

beforeEach(() => {
  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 102,
      adjudicationNumber: 1524493,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 197682,
        dateTimeOfIncident: '2021-12-09T10:30:00',
        handoverDeadline: '2021-12-11T10:30:00',
      },
      incidentRole: {
        roleCode: undefined,
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
    dateOfBirth: undefined,
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
      dateOfBirth: undefined,
    },
    associatedPrisoner: undefined,
  })
  const allOffencesSessionService = new AllOffencesSessionService()
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, decisionTreeService, allOffencesSessionService, userService }
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /details-of-offence/102/delete/1 view', () => {
  it('should show the offence to delete', async () => {
    const agent = request.agent(app)
    return agent.get(adjudicationUrls.detailsOfOffence.urls.start(102)).then(() =>
      // This call will populate the session, which we need for the delete page.
      agent
        .get(adjudicationUrls.detailsOfOffence.urls.delete(102, 2))
        .expect(200)
        // Title
        .expect(res => {
          expect(res.text).toContain('Do you want to delete this offence?')
          expect(res.text).toContain('A standard answer with child question')
          // Second offence - second question and answer
          expect(res.text).toContain('A child question')
          expect(res.text).toContain('A standard child answer')
        })
    )
  })
})

describe('POST /details-of-offence/102/delete/1 validation', () => {
  it('should show the offence to delete', async () => {
    const agent = request.agent(app)
    return agent.get(adjudicationUrls.detailsOfOffence.urls.start(102)).then(() =>
      // This call will populate the session, which we need for the delete page.
      agent
        .get(adjudicationUrls.detailsOfOffence.urls.delete(102, 2))
        .expect(200)
        .then(() =>
          agent.post(adjudicationUrls.detailsOfOffence.urls.delete(102, 2)).expect(res => {
            expect(res.text).toContain('Select yes if you want to delete this offence')
          })
        )
    )
  })
})

describe('POST /details-of-offence/102/delete/1', () => {
  it('should remove the offence when selecting yes', async () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfOffence.urls.start(102)) // This call will populate the session, which we need for the delete page.
      .expect(res => expect(res.text).toContain('A standard answer with child question')) // We will delete the offence with this answer
      .then(() =>
        agent.get(adjudicationUrls.detailsOfOffence.urls.delete(102, 2)).then(() =>
          agent
            .post(adjudicationUrls.detailsOfOffence.urls.delete(102, 2))
            .send({ confirmDelete: 'yes' })
            .expect(302)
            .expect('Location', adjudicationUrls.detailsOfOffence.urls.modified(102))
            .then(() =>
              agent
                .get(adjudicationUrls.detailsOfOffence.urls.modified(102))
                .expect(200)
                // The offence with this answer should be removed
                .expect(res => expect(res.text).not.toContain('A standard answer with child question'))
            )
        )
      )
  })

  it('should remove not remove the offence when selecting no', async () => {
    const agent = request.agent(app)
    return agent
      .get(adjudicationUrls.detailsOfOffence.urls.start(102)) // This call will populate the session, which we need for the delete page.
      .expect(res => expect(res.text).toContain('A standard answer with child question')) // We will decide not to delete the offence with this answer
      .then(() =>
        agent.get(adjudicationUrls.detailsOfOffence.urls.delete(102, 2)).then(() =>
          agent
            .post(adjudicationUrls.detailsOfOffence.urls.delete(102, 2))
            .send({ confirmDelete: 'no' })
            .expect(302)
            .expect('Location', adjudicationUrls.detailsOfOffence.urls.modified(102))
            .then(() =>
              agent
                .get(adjudicationUrls.detailsOfOffence.urls.modified(102))
                .expect(200)
                // The offence with this answer should still be present
                .expect(res => expect(res.text).toContain('A standard answer with child question'))
            )
        )
      )
  })
})
