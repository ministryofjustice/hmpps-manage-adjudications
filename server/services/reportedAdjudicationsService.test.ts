import ReportedAdjudicationsService from './reportedAdjudicationsService'

import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import CuriousApiService from './curiousApiService'

const getPrisonerDetails = jest.fn()
const getSecondaryLanguages = jest.fn()
const getReportedAdjudication = jest.fn()
const getNeurodiversitiesForReport = jest.fn()

jest.mock('../data/hmppsAuthClient')

jest.mock('../data/prisonApiClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getPrisonerDetails, getSecondaryLanguages }
  })
})
jest.mock('../data/manageAdjudicationsClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getReportedAdjudication }
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
    describe('with valid adjudication number', () => {
      beforeEach(() => {
        getReportedAdjudication.mockResolvedValue({
          reportedAdjudication: {
            adjudicationNumber: 123,
            prisonerNumber: 'A1234AA',
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
          reportExpirationDateTime: '2021-10-30T15:40',
          prisonerFirstName: 'JOHN',
          prisonerLastName: 'SMITH',
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
})
