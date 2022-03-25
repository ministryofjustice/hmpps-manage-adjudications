import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import LocationService from '../../services/locationService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import { IncidentRole } from '../../incidentRole/IncidentRole'

jest.mock('../../services/locationService.ts')
jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/decisionTreeService.ts')

const locationService = new LocationService(null) as jest.Mocked<LocationService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>

let app: Express

beforeEach(() => {
  reportedAdjudicationsService.createDraftFromCompleteAdjudication.mockResolvedValue(12345)

  decisionTreeService.draftAdjudicationData.mockResolvedValue({
    draftAdjudication: {
      id: 12345,
      adjudicationNumber: 1524661,
      prisonerNumber: 'G5512GK',
      incidentDetails: {
        locationId: 1,
        dateTimeOfIncident: '2021-03-08T10:45:00',
        handoverDeadline: '2021-03-10T10:45:00',
      },
      incidentRole: {},
      offenceDetails: [
        {
          offenceCode: 1002,
          offenceRule: {
            paragraphNumber: '1',
            paragraphDescription: 'Commits any assault',
          },
          victimPrisonersNumber: 'G6123VU',
        },
      ],
      incidentStatement: { statement: 'text here ', completed: true },
      startedByUserId: 'TEST_GEN',
    },
    incidentRole: IncidentRole.COMMITTED,
    prisoner: {
      offenderNo: 'G5512GK',
      firstName: 'BOBBY',
      lastName: 'DA SMITH JONES',
      assignedLivingUnit: {
        agencyId: 'MDI',
        locationId: 25549,
        description: '1-1-010',
        agencyName: 'Moorland (HMP & YOI)',
      },
      categoryCode: undefined,
      language: undefined,
      friendlyName: 'Bobby Da Smith Jones',
      displayName: 'Da Smith Jones, Bobby',
      prisonerNumber: 'G5512GK',
      currentLocation: '1-1-010',
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

  locationService.getIncidentLocations.mockResolvedValue([
    { locationId: 6, locationPrefix: 'OC', userDescription: 'Yard' },
    { locationId: 2, locationPrefix: 'P2', userDescription: 'Gym' },
    { locationId: 4, locationPrefix: 'P4', userDescription: 'Class' },
    { locationId: 1, locationPrefix: 'P1', userDescription: 'Chapel' },
  ])

  reportedAdjudicationsService.getPrisonerReport.mockResolvedValue({
    incidentDetails: [
      {
        label: 'Reporting Officer',
        value: 'T. User',
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
        value: 'Chapel',
      },
    ],
    statement: 'text here',
  })

  const qAndAs = [
    {
      question: 'What type of offence did Bobby Da Smith Jones commit?',
      answer: 'Assault, fighting, or endangering the health or personal safety of others',
    },
    {
      question: 'What did the incident involve?',
      answer: 'Assaulting someone',
    },
    {
      question: 'Who was assaulted?',
      answer: 'Another prisoner - John Saunders',
    },
    {
      question: 'Was the incident a racially aggravated assault?',
      answer: 'No',
    },
  ]

  decisionTreeService.getAdjudicationOffences.mockResolvedValue([
    {
      questionsAndAnswers: qAndAs,
      incidentRule: undefined,
      offenceRule: {
        paragraphNumber: '1',
        paragraphDescription: 'Commits any assault',
      },
    },
  ])

  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, locationService, decisionTreeService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner-report', () => {
  it('should load the prisoner report page', () => {
    return request(app)
      .get('/prisoner-report/12345/report')
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Bobby Da Smith Jones’ report')
        expect(response.text).toContain('10:45')
        expect(response.text).toContain('Chapel')
        expect(response.text).toContain('What type of offence did Bobby Da Smith Jones commit?')
        expect(response.text).toContain('Assault, fighting, or endangering the health or personal safety of others')
        expect(response.text).toContain('What did the incident involve?')
        expect(response.text).toContain('Assaulting someone')
        expect(response.text).toContain('Who was assaulted?')
        expect(response.text).toContain('Another prisoner - John Saunders')
        expect(response.text).toContain('Was the incident a racially aggravated assault?')
        expect(response.text).toContain('No')
        expect(response.text).toContain('This offence broke')
        expect(response.text).toContain('Prison rule 51, paragraph 1')
        expect(response.text).toContain('Commits any assault')
        expect(reportedAdjudicationsService.getPrisonerReport).toHaveBeenCalledTimes(1)
      })
  })
})
