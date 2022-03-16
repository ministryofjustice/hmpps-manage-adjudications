import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import { decision } from '../../offenceCodeDecisions/Decision'
import { IncidentRole as Role } from '../../incidentRole/IncidentRole'
import { PlaceholderText as Text } from '../../offenceCodeDecisions/Placeholder'
import { AnswerType as Type, answer } from '../../offenceCodeDecisions/Answer'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/decisionTreeService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>
const userService = new UserService(null) as jest.Mocked<UserService>
const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService
) as jest.Mocked<DecisionTreeService>

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

let app: Express

beforeEach(() => {
  decisionTreeService.getDecisionTree.mockReturnValue(testDecisionsTree)
  decisionTreeService.adjudicationData.mockReturnValue({
    // @ts-expect-error: TODO sort type error
    adjudicationNumber: 100,
    draftAdjudication: {
      id: 100,
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
    incidentRole: 'assisted',
    prisoner: {
      offenderNo: 'A8383DY',
      firstName: 'PHYLLIS',
      lastName: 'SMITH',
      assignedLivingUnit: {
        agencyId: 'MDI',
        locationId: 4012,
        description: 'RECP',
        agencyName: 'Moorland (HMP & YOI)',
      },
      categoryCode: undefined,
      language: undefined,
      prisonerNumber: 'A8383DY',
      friendlyName: 'Phyllis Smith',
      displayName: 'Smith, Phyllis',
      currentLocation: 'RECP',
    },
    associatedPrisoner: undefined,
  })

  decisionTreeService.allOffences.mockResolvedValue([
    {
      victimOtherPersonsName: undefined,
      victimPrisonersNumber: 'G6123VU',
      victimStaffUsername: undefined,
      offenceCode: '2001',
    },
  ])

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 100,
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
      assignedLivingUnit: {
        agencyId: 'MDI',
        locationId: 25928,
        description: '4-2-001',
        agencyName: 'Moorland (HMP & YOI)',
      },
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
      assignedLivingUnit: {
        agencyId: 'MDI',
        locationId: 25928,
        description: '4-2-001',
        agencyName: 'Moorland (HMP & YOI)',
      },
    },
  })

  locationService.getIncidentLocations.mockResolvedValue([
    { locationId: 5, locationPrefix: 'PC', userDescription: "Prisoner's cell" },
    { locationId: 6, locationPrefix: 'OC', userDescription: 'Rivendell' },
    { locationId: 2, locationPrefix: 'P2', userDescription: 'Hogwarts' },
    { locationId: 4, locationPrefix: 'P4', userDescription: 'Arundel' },
    { locationId: 1, locationPrefix: 'P1', userDescription: 'Timbuktu' },
    { locationId: 3, locationPrefix: 'P3', userDescription: 'Narnia' },
  ])

  placeOnReportService.getCheckYourAnswersInfo.mockResolvedValue({
    statement: '',
    incidentDetails: [
      {
        label: 'Reporting Officer',
        value: 'Test McTest',
      },
      {
        label: 'Date',
        value: '8 March 2020',
      },
      {
        label: 'Time',
        value: '10:45',
      },
      {
        label: 'Location',
        value: 'Rivendell',
      },
    ],
  })

  placeOnReportService.completeDraftAdjudication.mockResolvedValue(2342)

  app = appWithAllRoutes({ production: false }, { placeOnReportService, locationService, decisionTreeService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /check-your-answers', () => {
  it('should load the check-your-answers page', () => {
    return request(app)
      .get('/check-your-answers/G6415GD/1')
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Check your answers')
        expect(response.text).toContain('Accept and place on report')
        expect(response.text).toContain(
          'By accepting these details you are confirming that, to the best of your knowledge, these details are correct.'
        )
        expect(placeOnReportService.getCheckYourAnswersInfo).toHaveBeenCalledTimes(1)
      })
  })
})

describe('POST /check-your-answers', () => {
  it('should redirect to the correct page if details is complete', () => {
    return request(app)
      .post('/check-your-answers/G6415GD/1')
      .expect(302)
      .expect('Location', '/prisoner-placed-on-report/2342')
  })

  it('should throw an error on api failure', () => {
    placeOnReportService.completeDraftAdjudication.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post('/check-your-answers/G6415GD/1')
      .expect(response => {
        expect(response.text).toContain('Error: Internal Error')
      })
  })
})
