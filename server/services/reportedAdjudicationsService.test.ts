import moment from 'moment'
import ReportedAdjudicationsService from './reportedAdjudicationsService'

import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import CuriousApiService from './curiousApiService'
import LocationService from './locationService'
import { ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'

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

jest.mock('./locationService')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const curiousApiService = new CuriousApiService() as jest.Mocked<CuriousApiService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>

const token = 'token-1'
const user = {
  username: 'user1',
  name: 'User',
  activeCaseLoadId: 'MDI',
  token,
} as User

const location = {
  locationId: 27187,
  locationType: 'ADJU',
  description: 'ADJ',
  agencyId: 'MDI',
  parentLocationId: 27186,
  currentOccupancy: 0,
  locationPrefix: 'MDI-RES-MCASU-MCASU',
  userDescription: 'Adj',
  internalLocationCode: 'MCASU',
}

const agency = {
  agencyId: 'MDI',
  description: 'Moorland (HMP & YOI)',
}

describe('reportedAdjudicationsService', () => {
  let service: ReportedAdjudicationsService

  beforeEach(() => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    locationService.getIncidentLocation.mockResolvedValue(location)
    locationService.getAgency.mockResolvedValue(agency)
    hmppsAuthClient.getUserFromUsername.mockResolvedValue(user)
    service = new ReportedAdjudicationsService(hmppsAuthClient, curiousApiService, locationService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getYourCompletedAdjudications', () => {
    beforeEach(() => {
      const completedAdjudicationsContent = [
        {
          adjudicationNumber: 2,
          prisonerNumber: 'G6123VU',
          bookingId: 2,
          createdByUserId: 'TEST_GEN',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-01-01T11:45:00',
            handoverDeadline: '2021-01-03T11:45:00',
          },
          incidentStatement: {
            statement: 'My second incident',
          },
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        },
        {
          adjudicationNumber: 1,
          prisonerNumber: 'G6174VU',
          bookingId: 1,
          createdByUserId: 'TEST_GEN',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-01-01T11:30:00',
            handoverDeadline: '2021-01-03T11:30:00',
          },
          incidentStatement: {
            statement: 'My first incident',
          },
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
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
      getYourCompletedAdjudications.mockResolvedValue({
        size: 20,
        pageNumber: 0,
        totalElements: 2,
        content: completedAdjudicationsContent,
      })
    })

    it('returns the correct data', async () => {
      const result = await service.getYourCompletedAdjudications(
        user,
        {
          fromDate: moment('01/01/2021', 'DD/MM/YYYY'),
          toDate: moment('01/09/2021', 'DD/MM/YYYY'),
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        },
        {
          size: 20,
          number: 0,
        }
      )
      const expectedAdjudicationContent = [
        {
          displayName: 'Smith, John',
          formattedDateTimeOfIncident: '1 January 2021 - 11:45',
          dateTimeOfIncident: '2021-01-01T11:45:00',
          friendlyName: 'John Smith',
          adjudicationNumber: 2,
          prisonerNumber: 'G6123VU',
          bookingId: 2,
          createdByUserId: 'TEST_GEN',
          reportingOfficer: '',
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-01-01T11:45:00',
            handoverDeadline: '2021-01-03T11:45:00',
          },
          incidentStatement: {
            statement: 'My second incident',
          },
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
          statusDisplayName: 'Awaiting Review',
        },
        {
          displayName: 'Moriarty, James',
          formattedDateTimeOfIncident: '1 January 2021 - 11:30',
          dateTimeOfIncident: '2021-01-01T11:30:00',
          friendlyName: 'James Moriarty',
          adjudicationNumber: 1,
          createdByUserId: 'TEST_GEN',
          reportingOfficer: '',
          prisonerNumber: 'G6174VU',
          bookingId: 1,
          incidentDetails: {
            locationId: 3,
            dateTimeOfIncident: '2021-01-01T11:30:00',
            handoverDeadline: '2021-01-03T11:30:00',
          },
          incidentStatement: {
            statement: 'My first incident',
          },
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
          statusDisplayName: 'Awaiting Review',
        },
      ]

      const expected = {
        size: 20,
        pageNumber: 0,
        totalElements: 2,
        content: expectedAdjudicationContent,
      }

      expect(result).toEqual(expected)
    })
  })

  describe('getConfirmationDetails', () => {
    describe('with valid adjudication number', () => {
      beforeEach(() => {
        getReportedAdjudication.mockResolvedValue({
          reportedAdjudication: {
            adjudicationNumber: 123,
            prisonerNumber: 'A1234AA',
            createdByUserId: 'TEST_GEN',
            incidentDetails: {
              locationId: 3,
              dateTimeOfIncident: '2021-10-28T15:40:25.884',
              handoverDeadline: '2021-10-22T15:40:25.884',
            },
            incidentStatement: {
              statement: 'Example statement',
            },
            status: ReportedAdjudicationStatus.AWAITING_REVIEW,
          },
        })

        getPrisonerDetails.mockResolvedValue({
          offenderNo: 'A1234AA',
          firstName: 'JOHN',
          lastName: 'SMITH',
          language: 'Spanish',
          assignedLivingUnit: {
            description: 'Adj',
            agencyName: 'Moorland (HMP & YOI)',
          },
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
        const result = await service.getConfirmationDetails(123, user)

        expect(result).toEqual({
          incidentAgencyName: 'Moorland (HMP & YOI)',
          incidentLocationName: 'Adj',
          incidentDate: '2021-10-28T15:40:25.884',
          prisonerAgencyName: 'Moorland (HMP & YOI)',
          reportExpirationDateTime: '2021-10-22T15:40:25.884',
          prisonerLivingUnitName: 'Adj',
          prisonerFirstName: 'JOHN',
          prisonerLastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonerPreferredNonEnglishLanguage: 'Spanish',
          prisonerOtherLanguages: ['Spanish', 'German'],
          prisonerNeurodiversities: ['Hearing impairment', 'Visual impairment'],
          statement: 'Example statement',
          reportingOfficer: 'U. User',
        })
      })

      it('makes the correct calls', async () => {
        await service.getConfirmationDetails(123, user)

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
            createdByUserId: 'TEST_GEN',
            incidentDetails: {
              locationId: 3,
              dateTimeOfIncident: '2021-10-28T15:40:25.884',
              handoverDeadline: '2021-10-22T15:40:25.884',
            },
            incidentStatement: {
              statement: 'Example statement',
            },
            status: ReportedAdjudicationStatus.AWAITING_REVIEW,
          },
        })

        getPrisonerDetails.mockResolvedValue({
          offenderNo: 'A1234AA',
          firstName: 'JOHN',
          lastName: 'SMITH',
          language: 'English',
          assignedLivingUnit: {
            description: 'Adj',
            agencyName: 'Moorland (HMP & YOI)',
          },
        })

        getSecondaryLanguages.mockResolvedValue([])
      })

      it('returns the correct data', async () => {
        const result = await service.getConfirmationDetails(123, user)

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
          incidentDetails: {
            locationId: 27217,
            dateTimeOfIncident: '2021-11-30T14:10:00',
            handoverDeadline: '2021-12-02T14:10:00',
          },
          incidentStatement: { statement: 'Something happened' },
          createdByUserId: 'TEST_GEN',
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        },
        {
          adjudicationNumber: 1524425,
          prisonerNumber: 'G6415GD',
          bookingId: 1201638,
          incidentDetails: {
            locationId: 357592,
            dateTimeOfIncident: '2021-11-30T14:00:00',
            handoverDeadline: '2021-12-02T14:00:00',
          },
          incidentStatement: { statement: 'efe er3d 32r §' },
          createdByUserId: 'TEST_GEN',
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
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
      getAllCompletedAdjudications.mockResolvedValue({
        size: 20,
        pageNumber: 0,
        totalElements: 2,
        content: completedAdjudicationsContent,
      })
    })
    it('returns the data', async () => {
      const result = await service.getAllCompletedAdjudications(
        user,
        {
          fromDate: moment('01/01/2021', 'DD/MM/YYYY'),
          toDate: moment('01/01/2021', 'DD/MM/YYYY'),
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        },
        {
          size: 20,
          number: 0,
        }
      )

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
          incidentDetails: {
            handoverDeadline: '2021-12-02T14:10:00',
            locationId: 27217,
            dateTimeOfIncident: '2021-11-30T14:10:00',
          },
          incidentStatement: {
            statement: 'Something happened',
          },
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
          statusDisplayName: 'Awaiting Review',
        },

        {
          adjudicationNumber: 1524425,
          prisonerNumber: 'G6415GD',
          bookingId: 1201638,
          incidentDetails: {
            handoverDeadline: '2021-12-02T14:00:00',
            locationId: 357592,
            dateTimeOfIncident: '2021-11-30T14:00:00',
          },
          incidentStatement: {
            statement: 'efe er3d 32r §',
          },
          createdByUserId: 'TEST_GEN',
          displayName: 'Smith, Peter',
          friendlyName: 'Peter Smith',
          reportingOfficer: 'Test User',
          dateTimeOfIncident: '2021-11-30T14:00:00',
          formattedDateTimeOfIncident: '30 November 2021 - 14:00',
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
          statusDisplayName: 'Awaiting Review',
        },
      ]

      const expected = {
        size: 20,
        pageNumber: 0,
        totalElements: 2,
        content: expectedAdjudicationContent,
      }

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
          startedByUserId: 'TEST_GEN',
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
      const draftAdjudication = {
        id: 10,
        prisonerNumber: 'G6123VU',
        incidentDetails: {
          locationId: 26152,
          dateTimeOfIncident: '2021-11-04T07:20:00',
        },
        incidentStatement: {
          statement: 'Statement for a test',
        },
        startedByUserId: 'TEST_GEN',
        incidentRole: {
          associatedPrisonersNumber: 'G6415GD',
          roleCode: '25b',
        },
      }
      const result = await service.getPrisonerReport(user, locations, draftAdjudication)
      const expectedResult = {
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
        statement: 'Statement for a test',
      }
      expect(result).toEqual(expectedResult)
    })
  })

  describe('getReviewDetails', () => {
    beforeEach(() => {
      hmppsAuthClient.getUserFromUsername.mockResolvedValue({
        name: 'Test User',
        username: 'TEST_GEN',
        activeCaseLoadId: 'MDI',
        token: '',
        authSource: '',
      })
    })
    const adjudicationData = (
      status: ReportedAdjudicationStatus,
      reviewedByUserId: string = null,
      statusReason: string = null,
      statusDetails: string = null
    ) => {
      return {
        reportedAdjudication: {
          adjudicationNumber: 123,
          status,
          reviewedByUserId,
          statusReason,
          statusDetails,
          prisonerNumber: '',
          bookingId: 1,
          createdDateTime: '',
          createdByUserId: '',
          incidentDetails: {
            dateTimeOfIncident: '2021-11-03T13:10:00',
            handoverDeadline: '2021-11-05T13:10:00',
            locationId: 27029,
          },
          incidentStatement: {
            completed: false,
            statement: 'Statement here',
          },
          incidentRole: {
            associatedPrisonersNumber: '',
            roleCode: '',
          },
          offenceDetails: [
            {
              offenceCode: 16001,
              offenceRule: {
                paragraphNumber: '16',
                paragraphDescription:
                  'Intentionally or recklessly sets fire to any part of a prison or any other property, whether or not their own',
              },
            },
          ],
          isYouthOffender: false,
        },
      }
    }
    it('returns the correct information for a returned adjudication', async () => {
      const result = await service.getReviewDetails(
        adjudicationData(ReportedAdjudicationStatus.RETURNED, 'TEST_GEN', 'offence', 'wrong'),
        user
      )
      const expectedResult = {
        reviewStatus: 'Returned',
        reviewSummary: [
          {
            label: 'Last reviewed by',
            value: 'T. User',
          },
          {
            label: 'Reason for return',
            value: 'Incorrect offence chosen',
          },
          {
            label: 'Details',
            value: 'wrong',
          },
        ],
      }
      expect(result).toEqual(expectedResult)
    })
    it('returns the correct information for an adjudication awaiting review', async () => {
      const result = await service.getReviewDetails(adjudicationData(ReportedAdjudicationStatus.AWAITING_REVIEW), user)
      const expectedResult = {
        reviewStatus: 'Awaiting Review',
      }
      expect(result).toEqual(expectedResult)
    })
    it('returns the correct information for an accepted adjudication', async () => {
      const result = await service.getReviewDetails(
        adjudicationData(ReportedAdjudicationStatus.ACCEPTED, 'TEST_GEN'),
        user
      )
      const expectedResult = {
        reviewStatus: 'Accepted',
        reviewSummary: [
          {
            label: 'Last reviewed by',
            value: 'T. User',
          },
        ],
      }
      expect(result).toEqual(expectedResult)
    })
    it('returns the correct information for a rejected adjudication', async () => {
      const result = await service.getReviewDetails(
        adjudicationData(
          ReportedAdjudicationStatus.REJECTED,
          'TEST_GEN',
          'alternative',
          'Not worthy of adjudication, give them a fine instead.'
        ),
        user
      )
      const expectedResult = {
        reviewStatus: 'Rejected',
        reviewSummary: [
          {
            label: 'Last reviewed by',
            value: 'T. User',
          },
          {
            label: 'Reason for rejection',
            value: 'Should be dealt with in another way',
          },
          {
            label: 'Details',
            value: 'Not worthy of adjudication, give them a fine instead.',
          },
        ],
      }
      expect(result).toEqual(expectedResult)
    })
  })
})
