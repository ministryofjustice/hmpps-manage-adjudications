import ReportedAdjudicationsService from './reportedAdjudicationsService'

import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import CuriousApiService from './curiousApiService'
import { PageResponse } from '../utils/pageResponse'
import PageRequest from '../utils/pageRequest'

const getPrisonerDetails = jest.fn()
const getSecondaryLanguages = jest.fn()
const getReportedAdjudication = jest.fn()
const getNeurodiversitiesForReport = jest.fn()
const getBatchPrisonerDetails = jest.fn()
const getYourCompletedAdjudications = jest.fn()
const getAllCompletedAdjudications = jest.fn()

jest.mock('../data/hmppsAuthClient')

jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerDetails, getSecondaryLanguages, getBatchPrisonerDetails }
  })
})
jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getReportedAdjudication, getYourCompletedAdjudications, getAllCompletedAdjudications }
  })
})
jest.mock('./curiousApiService', () => {
  return jest.fn().mockImplementation(() => {
    return { getNeurodiversitiesForReport }
  })
})

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const curiousApiService = new CuriousApiService() as jest.Mocked<CuriousApiService>

const token = 'token-1'
const user = {
  username: 'user1',
  name: 'User',
  activeCaseLoadId: 'MDI',
  token,
} as User

describe('reportedAdjudicationsService', () => {
  let service: ReportedAdjudicationsService

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)

    service = new ReportedAdjudicationsService(hmppsAuthClient, curiousApiService)
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
          createdByUserId: 'NCLAMP_GEN',
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
          createdByUserId: 'NCLAMP_GEN',
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
          dateTimeOfIncident: '2021-11-15T11:45:00',
          friendlyName: 'John Smith',
          adjudicationNumber: 2,
          prisonerNumber: 'G6123VU',
          bookingId: 2,
          dateTimeReportExpires: '2021-11-17T11:45:00',
          createdByUserId: 'NCLAMP_GEN',
          reportingOfficer: '',
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
          dateTimeOfIncident: '2021-11-15T11:30:00',
          friendlyName: 'James Moriarty',
          adjudicationNumber: 1,
          createdByUserId: 'NCLAMP_GEN',
          reportingOfficer: '',
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

  describe('getReportedAdjudication', () => {
    describe('with valid adjudication number', () => {
      beforeEach(() => {
        getReportedAdjudication.mockResolvedValue({
          reportedAdjudication: {
            adjudicationNumber: 123,
            prisonerNumber: 'A1234AA',
            createdByUserId: 'NCLAMP_GEN',
            dateTimeReportExpires: '2021-10-22T15:40:25.884',
            incidentDetails: {
              locationId: 3,
              dateTimeOfIncident: '2021-10-28T15:40:25.884',
            },
            incidentStatement: {
              statement: 'Example statement',
              completed: true,
            },
          },
        })

        getPrisonerDetails.mockResolvedValue({
          offenderNo: 'A1234AA',
          firstName: 'JOHN',
          lastName: 'SMITH',
          language: 'Spanish',
        })

        getSecondaryLanguages.mockResolvedValue([
          {
            code: 'SPA',
            description: 'Spanish',
            canRead: true,
            canWrite: false,
            canSpeak: true,
          },
          {
            code: 'GER',
            description: 'German',
            canRead: true,
            canWrite: false,
            canSpeak: false,
          },
        ])

        getNeurodiversitiesForReport.mockResolvedValue(['Hearing impairment', 'Visual impairment'])
      })

      it('returns the correct data', async () => {
        const result = await service.getReportedAdjudication(123, user)

        expect(result).toEqual({
          reportExpirationDateTime: '2021-10-22T15:40:25.884',
          prisonerFirstName: 'JOHN',
          prisonerLastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonerPreferredNonEnglishLanguage: 'Spanish',
          prisonerOtherLanguages: ['Spanish', 'German'],
          prisonerNeurodiversities: ['Hearing impairment', 'Visual impairment'],
        })
      })

      it('makes the correct calls', async () => {
        await service.getReportedAdjudication(123, user)

        expect(ManageAdjudicationsClient).toBeCalledWith(token)
        expect(getReportedAdjudication).toBeCalledWith(123)
        expect(PrisonApiClient).toBeCalledWith(token)
        expect(getPrisonerDetails).toBeCalledWith('A1234AA')
        expect(getNeurodiversitiesForReport).toBeCalledWith('A1234AA', token)
      })
    })

    describe('with english only language information', () => {
      beforeEach(() => {
        getReportedAdjudication.mockResolvedValue({
          reportedAdjudication: {
            adjudicationNumber: 123,
            prisonerNumber: 'A1234AA',
            dateTimeReportExpires: '2021-10-22T15:40:25.884',
            createdByUserId: 'NCLAMP_GEN',
            incidentDetails: {
              locationId: 3,
              dateTimeOfIncident: '2021-10-28T15:40:25.884',
            },
            incidentStatement: {
              statement: 'Example statement',
              completed: true,
            },
          },
        })

        getPrisonerDetails.mockResolvedValue({
          offenderNo: 'A1234AA',
          firstName: 'JOHN',
          lastName: 'SMITH',
          language: 'English',
        })

        getSecondaryLanguages.mockResolvedValue([])
      })

      it('returns the correct data', async () => {
        const result = await service.getReportedAdjudication(123, user)

        expect(result.prisonerPreferredNonEnglishLanguage).toBeNull()
        expect(result.prisonerOtherLanguages.length).toEqual(0)
      })
    })
  })

  describe('getAllCompletedAdjudications', () => {
    beforeEach(() => {
      const completedAdjudicationsContent = [
        {
          adjudicationNumber: 2,
          prisonerNumber: 'G6123VU',
          bookingId: 2,
          dateTimeReportExpires: '2021-11-17T11:45:00',
          createdByUserId: 'NCLAMP_GEN',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-11-15T11:45:00',
          },
          incidentStatement: {
            statement: 'Statement 2',
          },
        },
        {
          adjudicationNumber: 1,
          prisonerNumber: 'G6174VU',
          bookingId: 1,
          dateTimeReportExpires: '2021-11-17T11:30:00',
          createdByUserId: 'NCLAMP_GEN',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-11-15T11:30:00',
          },
          incidentStatement: {
            statement: 'Statement 1',
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
          firstName: 'Thomas',
          lastName: 'Booker',
        },
      ]
      hmppsAuthClient.getUserFromUsername.mockResolvedValue({
        name: 'Natalie Clamp',
        username: 'TEST_GEN',
        activeCaseLoadId: 'MDI',
        token: '',
        authSource: '',
      })
      getBatchPrisonerDetails.mockResolvedValue(batchPrisonerDetails)
      getAllCompletedAdjudications.mockResolvedValue(new PageResponse(20, 1, 2, completedAdjudicationsContent, 1))
    })
    it('returns the data', async () => {
      const result = await service.getAllCompletedAdjudications(user, new PageRequest(20, 1, 1))

      const expectedAdjudicationContent = [
        {
          displayName: 'Smith, John',
          formattedDateTimeOfIncident: '15 November 2021 - 11:45',
          dateTimeOfIncident: '2021-11-15T11:45:00',
          friendlyName: 'John Smith',
          adjudicationNumber: 2,
          prisonerNumber: 'G6123VU',
          bookingId: 2,
          dateTimeReportExpires: '2021-11-17T11:45:00',
          createdByUserId: 'NCLAMP_GEN',
          reportingOfficer: 'Natalie Clamp',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-11-15T11:45:00',
          },
          incidentStatement: {
            statement: 'Statement 2',
          },
        },
        {
          displayName: 'Booker, Thomas',
          formattedDateTimeOfIncident: '15 November 2021 - 11:30',
          dateTimeOfIncident: '2021-11-15T11:30:00',
          friendlyName: 'Thomas Booker',
          adjudicationNumber: 1,
          createdByUserId: 'NCLAMP_GEN',
          reportingOfficer: 'Natalie Clamp',
          prisonerNumber: 'G6174VU',
          bookingId: 1,
          dateTimeReportExpires: '2021-11-17T11:30:00',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-11-15T11:30:00',
          },
          incidentStatement: {
            statement: 'Statement 1',
          },
        },
      ]

      const expected = new PageResponse(20, 1, 2, expectedAdjudicationContent, 1)

      expect(result).toEqual(expected)
    })
  })
})
