import moment from 'moment'
import ReportedAdjudicationsService from './reportedAdjudicationsService'

import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsSystemTokensClient from '../data/manageAdjudicationsSystemTokensClient'
import HmppsAuthClient from '../data/hmppsAuthClient'
import CuriousApiService from './curiousApiService'
import LocationService from './locationService'
import {
  IssueStatus,
  OicHearingType,
  ReportedAdjudicationDISFormFilter,
  ReportedAdjudicationStatus,
  allStatuses,
} from '../data/ReportedAdjudicationResult'
import TestData from '../routes/testutils/testData'
import {
  HearingOutcomeCode,
  HearingOutcomePlea,
  OutcomeCode,
  OutcomeHistory,
  ReferralOutcomeCode,
} from '../data/HearingAndOutcomeResult'
import HmppsManageUsersClient, { User } from '../data/hmppsManageUsersClient'
import { AdjudicationHistoryBookingType } from '../data/AdjudicationHistoryData'
import UserService from './userService'
import { LocationsApiLocation } from '../data/PrisonLocationResult'

const testData = new TestData()

const getPrisonerDetails = jest.fn()
const getSecondaryLanguages = jest.fn()
const getReportedAdjudication = jest.fn()
const getNeurodiversitiesForReport = jest.fn()
const getBatchPrisonerDetails = jest.fn()
const getYourCompletedAdjudications = jest.fn()
const getAllCompletedAdjudications = jest.fn()
const createDraftFromCompleteAdjudication = jest.fn()
const getHearingsGivenAgencyAndDate = jest.fn()
const getReportedAdjudicationIssueData = jest.fn()
const getReportedAdjudicationPrintData = jest.fn()
const getAlertsForPrisoner = jest.fn()
const getMovementByOffender = jest.fn()
const getPrisonerAdjudicationHistory = jest.fn()
const getPrisonerAdjudicationHistoryAllBookings = jest.fn()

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/hmppsManageUsersClient')

jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getPrisonerDetails,
      getSecondaryLanguages,
      getBatchPrisonerDetails,
      getMovementByOffender,
    }
  })
})
jest.mock('../data/alertApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getAlertsForPrisoner,
    }
  })
})
jest.mock('../data/manageAdjudicationsUserTokensClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getAllCompletedAdjudications,
    }
  })
})
jest.mock('../data/manageAdjudicationsSystemTokensClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getYourCompletedAdjudications,
      getReportedAdjudication,
      createDraftFromCompleteAdjudication,
      getHearingsGivenAgencyAndDate,
      getReportedAdjudicationIssueData,
      getReportedAdjudicationPrintData,
      getPrisonerAdjudicationHistory,
      getPrisonerAdjudicationHistoryAllBookings,
    }
  })
})
jest.mock('./curiousApiService', () => {
  return jest.fn().mockImplementation(() => {
    return { getNeurodiversitiesForReport }
  })
})

jest.mock('./locationService')
jest.mock('./userService')

const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
const hmppsManageUsersClient = new HmppsManageUsersClient() as jest.Mocked<HmppsManageUsersClient>
const curiousApiService = new CuriousApiService() as jest.Mocked<CuriousApiService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

const token = 'token-1'
const user = {
  activeCaseLoadId: 'MDI',
  name: 'Test User',
  username: 'user1',
  token: 'token-1',
  authSource: 'auth',
  meta: {
    caseLoadId: 'MDI',
  },
} as unknown as User

const location: LocationsApiLocation = {
  id: 'location-1',
  prisonId: 'MDI',
  key: 'MDI-VISITS-CLO_VIS',
  localName: 'Closed Visits',
}

const agency = {
  agencyId: 'MDI',
  description: 'Moorland (HMP & YOI)',
}

describe('reportedAdjudicationsService', () => {
  let service: ReportedAdjudicationsService

  beforeEach(() => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    locationService.getIncidentLocation.mockResolvedValue(location)
    locationService.getAgency.mockResolvedValue(agency)
    hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(user)
    service = new ReportedAdjudicationsService(
      hmppsAuthClient,
      hmppsManageUsersClient,
      curiousApiService,
      locationService,
      userService
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getYourCompletedAdjudications', () => {
    beforeEach(() => {
      const completedAdjudicationsContent = [
        testData.reportedAdjudication({
          chargeNumber: '2',
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-01-01T11:45:00',
          incidentStatement: {
            statement: 'My second incident',
          },
        }),
        testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'G6174VU',
          dateTimeOfIncident: '2021-01-01T11:30:00',
          incidentStatement: {
            statement: 'My first incident',
          },
        }),
      ]
      const batchPrisonerDetails = [
        testData.prisonerResultSummary({
          offenderNo: 'G6123VU',
          firstName: 'JOHN',
          lastName: 'SMITH',
        }),
        testData.prisonerResultSummary({
          offenderNo: 'G6174VU',
          firstName: 'James',
          lastName: 'Moriarty',
        }),
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
        testData.reportedAdjudication({
          chargeNumber: '2',
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-01-01T11:45:00',
          dateTimeOfDiscovery: '2021-01-01T11:45:00',
          incidentStatement: {
            statement: 'My second incident',
          },
          otherData: {
            displayName: 'Smith, John',
            formattedDateTimeOfIncident: '1 January 2021 - 11:45',
            formattedDateTimeOfDiscovery: '1 January 2021 - 11:45',
            formattedDateTimeOfScheduledHearing: ' - ',
            friendlyName: 'John Smith',
            statusDisplayName: 'Awaiting review',
            reportingOfficer: '',
            dateTimeOfIncident: '2021-01-01T11:45:00',
            dateTimeOfDiscovery: '2021-01-01T11:45:00',
            overrideAgencyName: null,
            originatingAgencyName: null,
            isReporterVersion: true,
          },
        }),
        testData.reportedAdjudication({
          chargeNumber: '1',
          prisonerNumber: 'G6174VU',
          dateTimeOfIncident: '2021-01-01T11:30:00',
          dateTimeOfDiscovery: '2021-01-01T11:30:00',
          incidentStatement: {
            statement: 'My first incident',
          },
          otherData: {
            displayName: 'Moriarty, James',
            formattedDateTimeOfIncident: '1 January 2021 - 11:30',
            formattedDateTimeOfDiscovery: '1 January 2021 - 11:30',
            formattedDateTimeOfScheduledHearing: ' - ',
            friendlyName: 'James Moriarty',
            statusDisplayName: 'Awaiting review',
            reportingOfficer: '',
            dateTimeOfIncident: '2021-01-01T11:30:00',
            dateTimeOfDiscovery: '2021-01-01T11:30:00',
            overrideAgencyName: null,
            originatingAgencyName: null,
            isReporterVersion: true,
          },
        }),
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
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '123',
            prisonerNumber: 'A1234AA',
            dateTimeOfIncident: '2021-10-28T15:40:25.884',
            incidentStatement: {
              statement: 'Example statement',
            },
            handoverDeadline: '2021-10-22T15:40:25.884',
          }),
        })

        getPrisonerDetails.mockResolvedValue(
          testData.prisonerResultSummary({
            offenderNo: 'A1234AA',
            firstName: 'JOHN',
            lastName: 'SMITH',
            language: 'Spanish',
          })
        )

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
        locationService.getIncidentLocation.mockResolvedValue({
          localName: 'Adj',
        } as LocationsApiLocation)

        const result = await service.getConfirmationDetails('123', user)

        expect(result).toEqual({
          incidentAgencyName: 'Moorland (HMP & YOI)',
          incidentLocationName: 'Adj',
          incidentDate: '2021-10-28T15:40:25.884',
          prisonerAgencyName: 'Moorland (HMPYOI)',
          reportExpirationDateTime: '2021-10-22T15:40:25.884',
          prisonerLivingUnitName: '1-2-015',
          prisonerFirstName: 'JOHN',
          prisonerLastName: 'SMITH',
          prisonerNumber: 'A1234AA',
          prisonerPreferredNonEnglishLanguage: 'Spanish',
          prisonerOtherLanguages: ['Spanish', 'German'],
          prisonerNeurodiversities: ['Hearing impairment', 'Visual impairment'],
          statement: 'Example statement',
          reportingOfficer: 'T. User',
          isYouthOffender: false,
          createdDateTime: '2022-12-09T10:30:00',
          prisonName: 'MDI',
          nonParoleDate: '2029-12-09',
          bookingId: 123,
        })
      })

      it('makes the correct calls', async () => {
        await service.getConfirmationDetails('123', user)

        expect(ManageAdjudicationsSystemTokensClient).toBeCalledWith(token, user)
        expect(getReportedAdjudication).toBeCalledWith('123')
        expect(PrisonApiClient).toBeCalledWith(token)
        expect(getPrisonerDetails).toBeCalledWith('A1234AA')
        expect(getNeurodiversitiesForReport).toBeCalledWith('A1234AA', token)
      })
    })

    describe('with english only language information', () => {
      beforeEach(() => {
        getReportedAdjudication.mockResolvedValue({
          reportedAdjudication: testData.reportedAdjudication({
            chargeNumber: '123',
            prisonerNumber: 'A1234AA',
          }),
        })
        getPrisonerDetails.mockResolvedValue(
          testData.prisonerResultSummary({
            offenderNo: 'A1234AA',
            firstName: 'JOHN',
            lastName: 'SMITH',
          })
        )
        getSecondaryLanguages.mockResolvedValue([])
      })

      it('returns the correct data', async () => {
        const result = await service.getConfirmationDetails('123', user)

        expect(result.prisonerPreferredNonEnglishLanguage).toBeNull()
        expect(result.prisonerOtherLanguages.length).toEqual(0)
      })
    })
  })

  describe('getAllCompletedAdjudications', () => {
    beforeEach(() => {
      const completedAdjudicationsContent = [
        testData.reportedAdjudication({
          chargeNumber: '1524427',
          prisonerNumber: 'A5041DY',
          dateTimeOfIncident: '2021-11-30T14:10:00',
          incidentStatement: { statement: 'Something happened' },
          locationId: 27187,
          locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        }),
        testData.reportedAdjudication({
          chargeNumber: '1524425',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-30T14:00:00',
          incidentStatement: { statement: 'Something happened' },
          locationId: 27187,
          locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        }),
      ]
      const batchPrisonerDetails = [
        testData.prisonerResultSummary({
          offenderNo: 'A5041DY',
          firstName: 'Michael',
          lastName: 'Willis',
        }),
        testData.prisonerResultSummary({ offenderNo: 'G6415GD', firstName: 'Peter', lastName: 'Smith' }),
      ]
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(testData.userFromUsername('TEST_GEN'))
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
        testData.reportedAdjudication({
          chargeNumber: '1524427',
          prisonerNumber: 'A5041DY',
          dateTimeOfIncident: '2021-11-30T14:10:00',
          incidentStatement: { statement: 'Something happened' },
          locationId: 27187,
          locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
          otherData: {
            displayName: 'Willis, Michael',
            friendlyName: 'Michael Willis',
            formattedDateTimeOfIncident: '30 November 2021 - 14:10',
            formattedDateTimeOfScheduledHearing: ' - ',
            statusDisplayName: 'Awaiting review',
            dateTimeOfIncident: '2021-11-30T14:10:00',
            formattedDateTimeOfDiscovery: '30 November 2021 - 14:10',
            dateTimeOfDiscovery: '2021-11-30T14:10:00',
            reportingOfficer: '',
            originatingAgencyName: 'Moorland (HMP & YOI)',
            overrideAgencyName: null,
          },
        }),
        testData.reportedAdjudication({
          chargeNumber: '1524425',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2021-11-30T14:00:00',
          incidentStatement: { statement: 'Something happened' },
          locationId: 27187,
          locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
          otherData: {
            displayName: 'Smith, Peter',
            friendlyName: 'Peter Smith',
            formattedDateTimeOfIncident: '30 November 2021 - 14:00',
            formattedDateTimeOfScheduledHearing: ' - ',
            statusDisplayName: 'Awaiting review',
            dateTimeOfIncident: '2021-11-30T14:00:00',
            formattedDateTimeOfDiscovery: '30 November 2021 - 14:00',
            dateTimeOfDiscovery: '2021-11-30T14:00:00',
            reportingOfficer: '',
            originatingAgencyName: 'Moorland (HMP & YOI)',
            overrideAgencyName: null,
          },
        }),
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
        draftAdjudication: testData.draftAdjudication({
          id: 10,
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2021-11-04T07:20:00',
          incidentStatement: {
            statement: 'Statement for a test',
          },
        }),
      })
      locationService.getIncidentLocation.mockResolvedValue({
        id: '26996',
        prisonId: 'MDI',
        key: 'MDI-VISITS-CLO_VIS',
        localName: 'Closed Visits',
      })
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(testData.userFromUsername('TEST_GEN'))
    })
    it('returns the correct information', async () => {
      const draftAdjudication = testData.draftAdjudication({
        id: 10,
        prisonerNumber: 'G6123VU',
        dateTimeOfIncident: '2021-11-16T07:21:00',
        dateTimeOfDiscovery: '2021-11-17T08:22:00',
        locationId: 25538,
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        incidentStatement: {
          statement: 'Statement for a test',
        },
        incidentRole: {
          associatedPrisonersNumber: 'G6415GD',
          roleCode: '25b',
        },
        otherData: {
          createdDateTime: '2021-11-17T07:00:00',
        },
      })
      const result = await service.getPrisonerReport(user, draftAdjudication)
      const expectedResult = {
        reportDetails: [
          {
            label: 'Reporting officer',
            value: 'T. User',
          },
          {
            label: 'Date report submitted',
            value: '17 November 2021',
          },
          {
            label: 'Time report submitted',
            value: '07:00',
          },
        ],
        incidentDetails: [
          {
            label: 'Date of incident',
            value: '16 November 2021',
          },
          {
            label: 'Time of incident',
            value: '07:21',
          },
          {
            label: 'Location',
            value: 'Closed Visits, Moorland (HMP & YOI)',
          },
          {
            label: 'Date of discovery',
            value: '17 November 2021',
          },
          {
            label: 'Time of discovery',
            value: '08:22',
          },
        ],
        statement: 'Statement for a test',
        isYouthOffender: false,
      }
      expect(result).toEqual(expectedResult)
    })
    it('returns the correct information with created on behalf of officer', async () => {
      const draftAdjudication = testData.draftAdjudication({
        id: 10,
        prisonerNumber: 'G6123VU',
        dateTimeOfIncident: '2021-11-16T07:21:00',
        dateTimeOfDiscovery: '2021-11-17T08:22:00',
        locationId: 25538,
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
        incidentStatement: {
          statement: 'Statement for a test',
        },
        incidentRole: {
          associatedPrisonersNumber: 'G6415GD',
          roleCode: '25b',
        },
        createdOnBehalfOfOfficer: 'some officer',
        createdOnBehalfOfReason: 'some reason',
        otherData: {
          createdDateTime: '2021-11-17T07:00:00',
        },
      })
      const result = await service.getPrisonerReport(user, draftAdjudication)
      const expectedResult = {
        reportDetails: [
          {
            label: 'Reporting officer',
            value: 'T. User on behalf of some officer',
          },
          {
            label: 'Date report submitted',
            value: '17 November 2021',
          },
          {
            label: 'Time report submitted',
            value: '07:00',
          },
        ],
        incidentDetails: [
          {
            label: 'Date of incident',
            value: '16 November 2021',
          },
          {
            label: 'Time of incident',
            value: '07:21',
          },
          {
            label: 'Location',
            value: 'Closed Visits, Moorland (HMP & YOI)',
          },
          {
            label: 'Date of discovery',
            value: '17 November 2021',
          },
          {
            label: 'Time of discovery',
            value: '08:22',
          },
        ],
        statement: 'Statement for a test',
        isYouthOffender: false,
      }
      expect(result).toEqual(expectedResult)
    })
  })

  describe('getReviewDetails', () => {
    beforeEach(() => {
      hmppsManageUsersClient.getUserFromUsername.mockResolvedValue(testData.userFromUsername('TEST_GEN'))
    })
    const adjudicationData = (
      status: ReportedAdjudicationStatus,
      reviewedByUserId: string = null,
      statusReason: string = null,
      statusDetails: string = null
    ) => {
      return testData.reportedAdjudication({
        chargeNumber: '123',
        prisonerNumber: 'G6123VU',
        status,
        otherData: {
          reviewedByUserId,
          statusReason,
          statusDetails,
        },
      })
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
        reviewStatus: 'Awaiting review',
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
    it('returns the correct information for an unscheduled adjudication', async () => {
      const result = await service.getReviewDetails(
        adjudicationData(ReportedAdjudicationStatus.UNSCHEDULED, 'TEST_GEN'),
        user
      )
      const expectedResult = {
        reviewStatus: 'Unscheduled',
        reviewSummary: [
          {
            label: 'Last reviewed by',
            value: 'T. User',
          },
        ],
      }
      expect(result).toEqual(expectedResult)
    })
    it('returns the correct information for an scheduled adjudication', async () => {
      const result = await service.getReviewDetails(
        adjudicationData(ReportedAdjudicationStatus.SCHEDULED, 'TEST_GEN'),
        user
      )
      const expectedResult = {
        reviewStatus: 'Scheduled',
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
  describe('getAdjudicationDISFormData', () => {
    it('success - confirm DIS1/2 has been issued page', async () => {
      getReportedAdjudicationIssueData.mockResolvedValue({
        reportedAdjudications: [
          testData.reportedAdjudication({
            chargeNumber: '1524493',
            prisonerNumber: 'G6123VU',
            dateTimeOfIncident: '2023-02-05T06:00:00',
            hearings: [testData.singleHearing({ dateTimeOfHearing: '2023-02-06T10:00:00' })],
          }),
        ],
      })
      getBatchPrisonerDetails.mockResolvedValue([testData.simplePrisoner('G6123VU', 'JOHN', 'SMITH', '1-0-015')])
      const defaultFilter: ReportedAdjudicationDISFormFilter = {
        fromDate: moment('03/02/2023', 'DD/MM/YYYY'),
        toDate: moment('05/02/2021', 'DD/MM/YYYY'),
        locationId: null,
        issueStatus: [IssueStatus.ISSUED, IssueStatus.NOT_ISSUED],
      }
      const result = await service.getAdjudicationDISFormData(user, defaultFilter, false)
      expect(result).toEqual([
        testData.reportedAdjudication({
          chargeNumber: '1524493',
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2023-02-05T06:00:00',
          hearings: [testData.singleHearing({ dateTimeOfHearing: '2023-02-06T10:00:00' })],
          otherData: {
            displayName: 'Smith, John',
            friendlyName: 'John Smith',
            issueStatus: IssueStatus.NOT_ISSUED,
            formsAlreadyIssued: false,
            dateTimeOfIssue: null,
            formattedDateTimeOfIssue: null,
            issuingOfficer: '',
            prisonerLocation: '1-0-015',
            dateTimeOfDiscovery: '2023-02-05T06:00:00',
            formattedDateTimeOfDiscovery: '5 February 2023 - 06:00',
            dateTimeOfFirstHearing: null,
            formattedDateTimeOfFirstHearing: null,
            relevantAlerts: null,
            formattedDisIssueHistory: [],
          },
        }),
      ])
    })
    it('success - print DIS1/2 forms page', async () => {
      getReportedAdjudicationPrintData.mockResolvedValue({
        reportedAdjudications: [
          testData.reportedAdjudication({
            chargeNumber: '1524493',
            prisonerNumber: 'G6123VU',
            dateTimeOfIncident: '2023-02-05T06:00:00',
            hearings: [testData.singleHearing({ dateTimeOfHearing: '2023-02-06T10:00:00' })],
          }),
        ],
      })
      getBatchPrisonerDetails.mockResolvedValue([testData.simplePrisoner('G6123VU', 'JOHN', 'SMITH', '1-0-015')])
      getAlertsForPrisoner.mockResolvedValue([])
      const defaultFilter: ReportedAdjudicationDISFormFilter = {
        fromDate: moment('03/02/2023', 'DD/MM/YYYY'),
        toDate: moment('05/02/2021', 'DD/MM/YYYY'),
        locationId: null,
        issueStatus: [IssueStatus.ISSUED, IssueStatus.NOT_ISSUED],
      }
      const result = await service.getAdjudicationDISFormData(user, defaultFilter, true)
      expect(result).toEqual([
        testData.reportedAdjudication({
          chargeNumber: '1524493',
          prisonerNumber: 'G6123VU',
          dateTimeOfIncident: '2023-02-05T06:00:00',
          hearings: [testData.singleHearing({ dateTimeOfHearing: '2023-02-06T10:00:00' })],
          otherData: {
            displayName: 'Smith, John',
            friendlyName: 'John Smith',
            issueStatus: IssueStatus.NOT_ISSUED,
            formsAlreadyIssued: false,
            dateTimeOfIssue: null,
            formattedDateTimeOfIssue: null,
            issuingOfficer: '',
            prisonerLocation: '1-0-015',
            dateTimeOfDiscovery: '2023-02-05T06:00:00',
            formattedDateTimeOfDiscovery: '5 February 2023 - 06:00',
            dateTimeOfFirstHearing: null,
            formattedDateTimeOfFirstHearing: null,
            relevantAlerts: [],
            formattedDisIssueHistory: [],
          },
        }),
      ])
    })
    it('deals with no prisoners - confirm DIS1/2 issued page', async () => {
      getReportedAdjudicationIssueData.mockResolvedValue({
        reportedAdjudications: [
          testData.reportedAdjudication({
            chargeNumber: '1524493',
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2023-02-05T06:00:00',
            hearings: [testData.singleHearing({ dateTimeOfHearing: '2023-02-06T10:00:00' })],
          }),
        ],
      })
      getBatchPrisonerDetails.mockResolvedValue([])
      const defaultFilter: ReportedAdjudicationDISFormFilter = {
        fromDate: moment('01/01/2021', 'DD/MM/YYYY'),
        toDate: moment('01/01/2021', 'DD/MM/YYYY'),
        locationId: null,
        issueStatus: [IssueStatus.ISSUED, IssueStatus.NOT_ISSUED],
      }
      const result = await service.getAdjudicationDISFormData(user, defaultFilter, false)
      expect(result).toEqual([
        testData.reportedAdjudication({
          chargeNumber: '1524493',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2023-02-05T06:00:00',
          hearings: [testData.singleHearing({ dateTimeOfHearing: '2023-02-06T10:00:00' })],
          otherData: {
            displayName: 'Unknown',
            friendlyName: 'Unknown',
            issueStatus: IssueStatus.NOT_ISSUED,
            formsAlreadyIssued: false,
            dateTimeOfIssue: null,
            formattedDateTimeOfIssue: null,
            issuingOfficer: '',
            prisonerLocation: 'Unknown',
            dateTimeOfDiscovery: '2023-02-05T06:00:00',
            formattedDateTimeOfDiscovery: '5 February 2023 - 06:00',
            dateTimeOfFirstHearing: null,
            formattedDateTimeOfFirstHearing: null,
            relevantAlerts: null,
            formattedDisIssueHistory: [],
          },
        }),
      ])
    })
    it('deals with no prisoners - print DIS1/2 page', async () => {
      getReportedAdjudicationPrintData.mockResolvedValue({
        reportedAdjudications: [
          testData.reportedAdjudication({
            chargeNumber: '1524493',
            prisonerNumber: 'G6415GD',
            dateTimeOfIncident: '2023-02-05T06:00:00',
            hearings: [testData.singleHearing({ dateTimeOfHearing: '2023-02-06T10:00:00' })],
          }),
        ],
      })
      getBatchPrisonerDetails.mockResolvedValue([])
      getAlertsForPrisoner.mockResolvedValue([])
      const defaultFilter: ReportedAdjudicationDISFormFilter = {
        fromDate: moment('01/01/2021', 'DD/MM/YYYY'),
        toDate: moment('01/01/2021', 'DD/MM/YYYY'),
        locationId: null,
        issueStatus: [IssueStatus.ISSUED, IssueStatus.NOT_ISSUED],
      }
      const result = await service.getAdjudicationDISFormData(user, defaultFilter, true)
      expect(result).toEqual([
        testData.reportedAdjudication({
          chargeNumber: '1524493',
          prisonerNumber: 'G6415GD',
          dateTimeOfIncident: '2023-02-05T06:00:00',
          hearings: [testData.singleHearing({ dateTimeOfHearing: '2023-02-06T10:00:00' })],
          otherData: {
            displayName: 'Unknown',
            friendlyName: 'Unknown',
            issueStatus: IssueStatus.NOT_ISSUED,
            formsAlreadyIssued: false,
            dateTimeOfIssue: null,
            formattedDateTimeOfIssue: null,
            issuingOfficer: '',
            prisonerLocation: 'Unknown',
            dateTimeOfDiscovery: '2023-02-05T06:00:00',
            formattedDateTimeOfDiscovery: '5 February 2023 - 06:00',
            dateTimeOfFirstHearing: null,
            formattedDateTimeOfFirstHearing: null,
            relevantAlerts: [],
            formattedDisIssueHistory: [],
          },
        }),
      ])
    })
  })
  describe('getOutcomesHistory', () => {
    it('returns empty array if there is no history present', async () => {
      const result = await service.getOutcomesHistory([], user)
      expect(result).toEqual([])
    })
    it('returns the correct data when everything is available except location name', async () => {
      locationService.getCorrespondingDpsLocationId.mockResolvedValue('location-id')
      locationService.getIncidentLocation.mockResolvedValue({
        localName: '',
      } as LocationsApiLocation)

      const hearingOutcome = testData.hearingOutcome({
        adjudicator: 'Jacob Marley',
        code: HearingOutcomeCode.COMPLETE,
        optionalItems: {
          plea: HearingOutcomePlea.GUILTY,
        },
      })
      const history = [
        {
          hearing: testData.singleHearing({
            dateTimeOfHearing: '2023-06-23T18:00:00',
            outcome: hearingOutcome,
            oicHearingType: OicHearingType.INAD_ADULT,
          }),

          outcome: {
            outcome: testData.outcome({
              code: OutcomeCode.CHARGE_PROVED,
              quashedReason: undefined,
              reason: undefined,
            }),
          },
        },
      ]
      const result = await service.getOutcomesHistory(history, user)
      const expectedResult = [
        {
          hearing: {
            agencyId: 'MDI',
            convertedAdjudicator: null as void,
            dateTimeOfHearing: '2023-06-23T18:00:00',
            id: 101,
            locationId: 'location-id',
            locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
            locationName: 'Moorland (HMP & YOI)',
            oicHearingType: OicHearingType.INAD_ADULT,
            outcome: {
              adjudicator: 'Jacob Marley',
              code: HearingOutcomeCode.COMPLETE,
              id: 1,
              plea: HearingOutcomePlea.GUILTY,
            },
          },
          outcome: {
            code: OutcomeCode.CHARGE_PROVED,
            details: 'Some details',
            id: 1,
          },
        },
      ]
      expect(result).toEqual(expectedResult)
    })
    it('returns the correct data when everything is available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locationService.getIncidentLocation.mockResolvedValue(testData.residentialLocations()[0] as any)
      locationService.getIncidentLocation.mockResolvedValue({
        id: 'location-id',
        localName: 'Houseblock 1',
      } as LocationsApiLocation)
      const hearingOutcome = testData.hearingOutcome({
        adjudicator: 'Jacob Marley',
        code: HearingOutcomeCode.COMPLETE,
        optionalItems: {
          plea: HearingOutcomePlea.GUILTY,
        },
      })
      const history = [
        {
          hearing: testData.singleHearing({
            dateTimeOfHearing: '2023-06-23T18:00:00',
            outcome: hearingOutcome,
            oicHearingType: OicHearingType.INAD_ADULT,
            locationId: 25538,
            locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
          }),

          outcome: {
            outcome: testData.outcome({
              code: OutcomeCode.CHARGE_PROVED,
              quashedReason: undefined,
              reason: undefined,
            }),
          },
        },
      ]
      locationService.getCorrespondingDpsLocationId.mockResolvedValue('location-id')

      const result = await service.getOutcomesHistory(history, user)
      const expectedResult = [
        {
          hearing: {
            agencyId: 'MDI',
            convertedAdjudicator: null as void,
            dateTimeOfHearing: '2023-06-23T18:00:00',
            id: 101,
            locationId: 'location-id',
            locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
            locationName: 'Houseblock 1, Moorland (HMP & YOI)',
            oicHearingType: OicHearingType.INAD_ADULT,
            outcome: {
              adjudicator: 'Jacob Marley',
              code: HearingOutcomeCode.COMPLETE,
              id: 1,
              plea: HearingOutcomePlea.GUILTY,
            },
          },
          outcome: {
            code: OutcomeCode.CHARGE_PROVED,
            details: 'Some details',
            id: 1,
          },
        },
      ]
      expect(result).toEqual(expectedResult)
    })
  })
  describe('getLastOutcomeItem', () => {
    it('returns the only item if there is only one outcome on the adjudication', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          prisonerNumber: 'A1234AA',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({}),
              },
            },
          ],
        }),
      })
      const result = await service.getLastOutcomeItem('123', [ReportedAdjudicationStatus.CHARGE_PROVED], user)
      expect(result).toEqual({
        hearing: testData.singleHearing({
          dateTimeOfHearing: '2023-03-10T22:00:00',
          outcome: testData.hearingOutcome({
            code: HearingOutcomeCode.COMPLETE,
          }),
        }),
        outcome: {
          outcome: testData.outcome({}),
        },
      })
    })
    it('returns the final item in the outcomes array if there are numerous available', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          prisonerNumber: 'A1234AA',
          status: ReportedAdjudicationStatus.CHARGE_PROVED,
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-14T18:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.REFER_INAD,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.REFER_INAD,
                }),
                referralOutcome: testData.referralOutcome({
                  code: ReferralOutcomeCode.SCHEDULE_HEARING,
                }),
              },
            },
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-15T15:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.COMPLETE,
                }),
              }),
              outcome: {
                outcome: testData.outcome({
                  code: OutcomeCode.CHARGE_PROVED,
                }),
              },
            },
          ],
        }),
      })
      const result = await service.getLastOutcomeItem('123', [ReportedAdjudicationStatus.CHARGE_PROVED], user)
      expect(result).toEqual({
        hearing: testData.singleHearing({
          dateTimeOfHearing: '2023-03-15T15:00:00',
          outcome: testData.hearingOutcome({
            code: HearingOutcomeCode.COMPLETE,
          }),
        }),
        outcome: {
          outcome: testData.outcome({
            code: OutcomeCode.CHARGE_PROVED,
          }),
        },
      })
    })
    it('returns an empty object if the last item in the outcomes array does not match the current status', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          prisonerNumber: 'A1234AA',
          status: ReportedAdjudicationStatus.ADJOURNED,
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
          outcomes: [
            {
              hearing: testData.singleHearing({
                dateTimeOfHearing: '2023-03-10T22:00:00',
                outcome: testData.hearingOutcome({
                  code: HearingOutcomeCode.ADJOURN,
                }),
              }),
            },
          ] as OutcomeHistory,
        }),
      })
      const result = await service.getLastOutcomeItem('123', [ReportedAdjudicationStatus.CHARGE_PROVED], user)
      expect(result).toEqual({})
    })
  })
  describe('getLatestHearing', () => {
    it('it returns an empty object if there are no hearings already', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          prisonerNumber: 'A1234AA',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
        }),
      })
      const result = await service.getLatestHearing('123', user)
      expect(result).toEqual({})
    })
    it('returns the latest hearing if there are some present', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          prisonerNumber: 'A1234AA',
          status: ReportedAdjudicationStatus.SCHEDULED,
          dateTimeOfIncident: '2023-03-20T10:00:00',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-03-21T10:05:00',
            }),
            testData.singleHearing({
              dateTimeOfHearing: '2023-03-21T19:00:00',
            }),
          ],
        }),
      })
      const result = await service.getLatestHearing('123', user)
      expect(result).toEqual(
        testData.singleHearing({
          dateTimeOfHearing: '2023-03-21T19:00:00',
        })
      )
    })
  })
  describe('getLatestNonMatchingHearing', () => {
    it('it returns an empty object if there are no hearings', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          prisonerNumber: 'A1234AA',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
        }),
      })
      const result = await service.getLatestNonMatchingHearing('123', 1, user)
      expect(result).toEqual({})
    })
    it('it returns an empty object if there is a hearing, but it is the matching one', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          prisonerNumber: 'A1234AA',
          status: ReportedAdjudicationStatus.UNSCHEDULED,
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-03-21T19:00:00',
              id: 1,
            }),
          ],
        }),
      })
      const result = await service.getLatestNonMatchingHearing('123', 1, user)
      expect(result).toEqual({})
    })
    it('returns the latest hearing that does not match the one being compared', async () => {
      getReportedAdjudication.mockResolvedValue({
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '123',
          prisonerNumber: 'A1234AA',
          status: ReportedAdjudicationStatus.SCHEDULED,
          dateTimeOfIncident: '2023-03-20T10:00:00',
          hearings: [
            testData.singleHearing({
              dateTimeOfHearing: '2023-03-21T10:05:00',
              id: 1,
            }),
            testData.singleHearing({
              dateTimeOfHearing: '2023-03-21T19:00:00',
              id: 2,
            }),
          ],
        }),
      })
      const result = await service.getLatestNonMatchingHearing('123', 2, user)
      expect(result).toEqual(
        testData.singleHearing({
          dateTimeOfHearing: '2023-03-21T10:05:00',
          id: 1,
        })
      )
    })
  })
  describe('getPrisonerLatestADMMovement', () => {
    it('should return null if there are no transfers that match the overrideAgencyId', async () => {
      getMovementByOffender.mockResolvedValue([])
      getPrisonerDetails.mockResolvedValue(testData.simplePrisoner('A1234AA', 'Harry', 'Potter', '1-2-015'))
      const result = await service.getPrisonerLatestADMMovement('A1234AA', 'LEI', '2023-03-21T10:05:00', user)
      expect(result).toEqual(null)
    })
    it('should return correct info', async () => {
      getMovementByOffender.mockResolvedValue(testData.prisonerMovement({}))
      getPrisonerDetails.mockResolvedValue(testData.simplePrisoner('A1234AA', 'Harry', 'Potter', '1-2-015'))
      const result = await service.getPrisonerLatestADMMovement('A1234AA', 'LEI', '2023-03-21T10:05:00', user)
      expect(result).toEqual({
        movementDate: '19 November 2030',
        toAgencyDescription: 'Leeds (HMP)',
        prisonerName: 'Harry Potter',
      })
    })
  })
  describe('getTransferBannerInfo', () => {
    it('if there is no overrideAgencyId, should return content as null', async () => {
      const reportedAdjudication = testData.reportedAdjudication({
        chargeNumber: '123',
        prisonerNumber: 'G6123VU',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        overrideAgencyId: null,
        otherData: {
          transferableActionsAllowed: true,
        },
      })
      const result = await service.getTransferBannerInfo(reportedAdjudication, user)
      expect(result).toEqual({
        originatingAgencyToAddOutcome: false,
        transferBannerContent: null,
      })
    })
    it('if the user is based in the agency where the adjudication was created', async () => {
      getMovementByOffender.mockResolvedValue(testData.prisonerMovement({ offenderNo: 'G6123VU' }))
      getPrisonerDetails.mockResolvedValue(testData.simplePrisoner('G6123VU', 'Harry', 'Potter', '1-2-015'))

      const reportedAdjudication = testData.reportedAdjudication({
        chargeNumber: '123',
        prisonerNumber: 'G6123VU',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        otherData: {
          overrideAgencyId: 'LEI',
          transferableActionsAllowed: true,
        },
      })
      const result = await service.getTransferBannerInfo(reportedAdjudication, user)
      expect(result).toEqual({
        originatingAgencyToAddOutcome: false,
        transferBannerContent: 'Harry Potter was transferred to Leeds (HMP) on 19 November 2030',
      })
    })
    it('if the user is based in the agency where the adjudication has been transferred to', async () => {
      const reportedAdjudication = testData.reportedAdjudication({
        chargeNumber: '123',
        prisonerNumber: 'G6123VU',
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        otherData: {
          overrideAgencyId: 'LEI',
          transferableActionsAllowed: true,
        },
      })
      const userInLeeds = {
        activeCaseLoadId: 'LEI',
        name: '',
        username: 'user1',
        token: 'token-1',
        authSource: 'auth',
        meta: {
          caseLoadId: 'LEI',
        },
      } as unknown as User
      const result = await service.getTransferBannerInfo(reportedAdjudication, userInLeeds)
      expect(result).toEqual({
        originatingAgencyToAddOutcome: false,
        transferBannerContent: 'This incident was reported at Moorland (HMP & YOI)',
      })
    })
    it('user based in override, transferableActionsAllowed false as hearing present without outcome', async () => {
      const reportedAdjudication = testData.reportedAdjudication({
        chargeNumber: '123',
        prisonerNumber: 'G6123VU',
        status: ReportedAdjudicationStatus.SCHEDULED,
        otherData: {
          overrideAgencyId: 'LEI',
          transferableActionsAllowed: false,
        },
      })
      const userInLeeds = {
        activeCaseLoadId: 'LEI',
        name: '',
        username: 'user1',
        token: 'token-1',
        authSource: 'auth',
        meta: {
          caseLoadId: 'LEI',
        },
      } as unknown as User
      const result = await service.getTransferBannerInfo(reportedAdjudication, userInLeeds)
      expect(result).toEqual({
        originatingAgencyToAddOutcome: true,
        transferBannerContent: 'This incident was reported at Moorland (HMP & YOI)',
      })
    })
  })
  describe('getUniqueListOfAgenciesForPrisoner', () => {
    it('should return an array of objects containing id and description of agency', async () => {
      getMovementByOffender.mockResolvedValue(testData.prisonerMovement({ offenderNo: 'G6123VU' }))
      getPrisonerDetails.mockResolvedValue(testData.simplePrisoner('G6123VU', 'Harry', 'Potter', '1-2-015'))
      const result = await service.getUniqueListOfAgenciesForPrisoner('G6123VU', user)
      expect(result).toEqual([
        {
          agency: 'MDI',
          agencyDescription: 'Moorland (HMP & YOI)',
        },
        {
          agency: 'LEI',
          agencyDescription: 'Leeds (HMP)',
        },
      ])
    })
    it('should remove duplicates', async () => {
      getMovementByOffender.mockResolvedValue(testData.prisonerMovement({ offenderNo: 'G6123VU', single: false }))
      getPrisonerDetails.mockResolvedValue(testData.simplePrisoner('G6123VU', 'Harry', 'Potter', '1-2-015'))
      const result = await service.getUniqueListOfAgenciesForPrisoner('G6123VU', user)
      expect(result).toEqual([
        {
          agency: 'MDI',
          agencyDescription: 'Moorland (HMP & YOI)',
        },
        {
          agency: 'LEI',
          agencyDescription: 'Leeds (HMP)',
        },
      ])
    })
    it("removes any nulls where there wasn't a match", async () => {
      getMovementByOffender.mockResolvedValue([
        ...testData.prisonerMovement({ offenderNo: 'G6123VU' }),
        ...testData.prisonerMovement({ offenderNo: 'G6123VU', toAgency: 'OUT' }),
      ])
      getPrisonerDetails.mockResolvedValue(testData.simplePrisoner('G6123VU', 'Harry', 'Potter', '1-2-015'))
      const result = await service.getUniqueListOfAgenciesForPrisoner('G6123VU', user)
      expect(result).toEqual([
        {
          agency: 'MDI',
          agencyDescription: 'Moorland (HMP & YOI)',
        },
        {
          agency: 'LEI',
          agencyDescription: 'Leeds (HMP)',
        },
      ])
    })
  })
  describe('getAdjudicationHistory', () => {
    const prisoner = testData.prisonerResultSummary({
      offenderNo: 'G6123VU',
      firstName: 'John',
      lastName: 'Saunders',
    })
    const agencies = [
      {
        agency: 'MDI',
        agencyDescription: 'Moorland (HMP & YOI)',
      },
      {
        agency: 'LEI',
        agencyDescription: 'Leeds (HMP)',
      },
    ]
    const pageRequest = { size: 20, number: 1 }
    it('uses the booking id api call as default', async () => {
      getPrisonerAdjudicationHistory.mockResolvedValue({
        size: 20,
        number: 1,
        totalElements: 1,
        content: [testData.reportedAdjudication({ chargeNumber: '1234', prisonerNumber: 'G6123VU' })],
      })
      const result = await service.getAdjudicationHistory(
        prisoner,
        agencies,
        { bookingType: AdjudicationHistoryBookingType.CURRENT, status: allStatuses },
        pageRequest,
        user
      )
      expect(getPrisonerAdjudicationHistoryAllBookings).not.toHaveBeenCalled()
      expect(getPrisonerAdjudicationHistory).toHaveBeenCalled()
      expect(result).toEqual({
        size: 20,
        number: 1,
        totalElements: 1,
        content: [testData.reportedAdjudication({ chargeNumber: '1234', prisonerNumber: 'G6123VU' })],
      })
    })
    it('calls the all bookings endpoint if user selects all bookings', async () => {
      getPrisonerAdjudicationHistoryAllBookings.mockResolvedValue({
        size: 20,
        number: 1,
        totalElements: 1,
        content: [testData.reportedAdjudication({ chargeNumber: '1234', prisonerNumber: 'G6123VU' })],
      })
      const result = await service.getAdjudicationHistory(
        prisoner,
        agencies,
        { bookingType: AdjudicationHistoryBookingType.ALL, status: allStatuses },
        pageRequest,
        user
      )
      expect(getPrisonerAdjudicationHistoryAllBookings).toHaveBeenCalled()
      expect(getPrisonerAdjudicationHistory).not.toHaveBeenCalled()
      expect(result).toEqual({
        size: 20,
        number: 1,
        totalElements: 1,
        content: [testData.reportedAdjudication({ chargeNumber: '1234', prisonerNumber: 'G6123VU' })],
      })
    })
  })
})
