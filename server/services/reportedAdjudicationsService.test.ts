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
const createDraftFromCompleteAdjudication = jest.fn()

jest.mock('../data/hmppsAuthClient')

jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerDetails, getSecondaryLanguages, getBatchPrisonerDetails }
  })
})
jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getReportedAdjudication,
      getYourCompletedAdjudications,
      getAllCompletedAdjudications,
      createDraftFromCompleteAdjudication,
    }
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
          adjudicationNumber: 1524427,
          prisonerNumber: 'A5041DY',
          bookingId: 1200675,
          dateTimeReportExpires: '2021-12-02T14:10:00',
          incidentDetails: {
            locationId: 27217,
            dateTimeOfIncident: '2021-11-30T14:10:00',
            handoverDeadline: '2021-12-02T14:10:00',
          },
          incidentStatement: { statement: 'Something happened', completed: false },
          createdByUserId: 'TEST_GEN',
        },
        {
          adjudicationNumber: 1524425,
          prisonerNumber: 'G6415GD',
          bookingId: 1201638,
          dateTimeReportExpires: '2021-12-02T14:00:00',
          incidentDetails: {
            locationId: 357592,
            dateTimeOfIncident: '2021-11-30T14:00:00',
            handoverDeadline: '2021-12-02T14:00:00',
          },
          incidentStatement: { statement: 'efe er3d 32r §', completed: false },
          createdByUserId: 'TEST_GEN',
        },
      ]
      const batchPrisonerDetails = [
        {
          offenderNo: 'A5041DY',
          firstName: 'Michael',
          lastName: 'Willis',
        },
        {
          offenderNo: 'G6415GD',
          firstName: 'Peter',
          lastName: 'Smith',
        },
      ]
      hmppsAuthClient.getUserFromUsername.mockResolvedValue({
        name: 'Test User',
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
          createdByUserId: 'TEST_GEN',
          displayName: 'Willis, Michael',
          friendlyName: 'Michael Willis',
          reportingOfficer: 'Test User',
          dateTimeOfIncident: '2021-11-30T14:10:00',
          formattedDateTimeOfIncident: '30 November 2021 - 14:10',
          adjudicationNumber: 1524427,
          prisonerNumber: 'A5041DY',
          bookingId: 1200675,
          dateTimeReportExpires: '2021-12-02T14:10:00',
          incidentDetails: {
            handoverDeadline: '2021-12-02T14:10:00',
            locationId: 27217,
            dateTimeOfIncident: '2021-11-30T14:10:00',
          },
          incidentStatement: {
            completed: false,
            statement: 'Something happened',
          },
        },

        {
          adjudicationNumber: 1524425,
          prisonerNumber: 'G6415GD',
          bookingId: 1201638,
          dateTimeReportExpires: '2021-12-02T14:00:00',
          incidentDetails: {
            handoverDeadline: '2021-12-02T14:00:00',
            locationId: 357592,
            dateTimeOfIncident: '2021-11-30T14:00:00',
          },
          incidentStatement: {
            completed: false,
            statement: 'efe er3d 32r §',
          },
          createdByUserId: 'TEST_GEN',
          displayName: 'Smith, Peter',
          friendlyName: 'Peter Smith',
          reportingOfficer: 'Test User',
          dateTimeOfIncident: '2021-11-30T14:00:00',
          formattedDateTimeOfIncident: '30 November 2021 - 14:00',
        },
      ]

      const expected = new PageResponse(20, 1, 2, expectedAdjudicationContent, 1)

      expect(result).toEqual(expected)
    })
  })

  describe('getPrisonerReport', () => {
    beforeEach(() => {
      createDraftFromCompleteAdjudication.mockResolvedValue({
        draftAdjudication: {
          id: 10,
          prisonerNumber: 'G6123VU',
          incidentDetails: {
            locationId: 26152,
            dateTimeOfIncident: '2021-11-04T07:20:00',
          },
          incidentStatement: {
            statement: 'Statement for a test',
          },
          createdByUserId: 'TEST_GEN',
          createdDateTime: '2021-11-04T09:21:21.95935',
        },
      })

      hmppsAuthClient.getUserFromUsername.mockResolvedValue({
        name: 'Test User',
        username: 'TEST_GEN',
        activeCaseLoadId: 'MDI',
        token: '',
        authSource: '',
      })
    })
    it('returns the correct information', async () => {
      const locations = [
        { locationId: 26152, locationPrefix: 'P3', userDescription: 'place 3', description: '' },
        { locationId: 26155, locationPrefix: 'PC', userDescription: "Prisoner's cell", description: '' },
        { locationId: 26151, locationPrefix: 'P1', userDescription: 'place 1', description: '' },
      ]
      const result = await service.getPrisonerReport(user, 1234, locations)
      const expectedResult = {
        reportNo: 1234,
        draftId: 10,
        incidentDetails: [
          {
            label: 'Reporting Officer',
            value: 'T. User',
          },
          {
            label: 'Date',
            value: '4 November 2021',
          },
          {
            label: 'Time',
            value: '07:20',
          },
          {
            label: 'Location',
            value: 'place 3',
          },
        ],
        statement: "<p class='govuk-body'>Statement for a test</p>",
      }
      expect(result).toEqual(expectedResult)
    })
  })
})
