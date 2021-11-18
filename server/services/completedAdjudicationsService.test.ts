import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import CompletedAdjudicationsService from './completedAdjudicationsService'
import PageRequest from '../utils/pageRequest'
import { PageResponse } from '../utils/pageResponse'

const getBatchPrisonerDetails = jest.fn()
const getYourCompletedAdjudications = jest.fn()

jest.mock('../data/hmppsAuthClient')

jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getBatchPrisonerDetails }
  })
})
jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getYourCompletedAdjudications }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

const token = 'token-1'
const user = {
  username: 'user1',
  name: 'User',
  activeCaseLoadId: 'MDI',
  token,
} as User

describe('completedAdjudicationsService', () => {
  let service: CompletedAdjudicationsService

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new CompletedAdjudicationsService(hmppsAuthClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getReportedAdjudication', () => {
    beforeEach(() => {
      const completedAdjudicationsContent = [
        {
          adjudicationNumber: 2,
          prisonerNumber: 'G6123VU',
          bookingId: 2,
          dateTimeReportExpires: '2021-11-17T11:45:00',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-11-15T11:45:00',
          },
          incidentStatement: {
            statement: 'My second incident',
          },
        },
        {
          adjudicationNumber: 1,
          prisonerNumber: 'G6174VU',
          bookingId: 1,
          dateTimeReportExpires: '2021-11-17T11:30:00',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-11-15T11:30:00',
          },
          incidentStatement: {
            statement: 'My first incident',
          },
        },
      ]
      const batchPrisonerDetails = [
        {
          offenderNo: 'G6123VU',
          firstName: 'JOHN',
          lastName: 'SMITH',
        },
        {
          offenderNo: 'G6174VU',
          firstName: 'James',
          lastName: 'Moriarty',
        },
      ]
      getBatchPrisonerDetails.mockResolvedValue(batchPrisonerDetails)
      getYourCompletedAdjudications.mockResolvedValue(new PageResponse(20, 1, 2, completedAdjudicationsContent, 1))
    })

    it('returns the correct data', async () => {
      const result = await service.getYourCompletedAdjudications(user, new PageRequest(20, 1, 1))

      const expectedAdjudicationContent = [
        {
          displayName: 'Smith, John',
          formattedDateTimeOfIncident: '15 November 2021 - 11:45',
          dateTimeOfIncident: new Date('2021-11-15T11:45:00'),
          friendlyName: 'John Smith',
          adjudicationNumber: 2,
          prisonerNumber: 'G6123VU',
          bookingId: 2,
          dateTimeReportExpires: '2021-11-17T11:45:00',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-11-15T11:45:00',
          },
          incidentStatement: {
            statement: 'My second incident',
          },
        },
        {
          displayName: 'Moriarty, James',
          formattedDateTimeOfIncident: '15 November 2021 - 11:30',
          dateTimeOfIncident: new Date('2021-11-15T11:30:00'),
          friendlyName: 'James Moriarty',
          adjudicationNumber: 1,
          prisonerNumber: 'G6174VU',
          bookingId: 1,
          dateTimeReportExpires: '2021-11-17T11:30:00',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-11-15T11:30:00',
          },
          incidentStatement: {
            statement: 'My first incident',
          },
        },
      ]

      const expected = new PageResponse(20, 1, 2, expectedAdjudicationContent, 1)

      expect(result).toEqual(expected)
    })
  })
})
